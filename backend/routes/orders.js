const express = require('express');
const db = require('../config/database');
const { authenticate, adminOnly } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const userOnly = async (req, res, next) => {
  try {
    const [kullanıcılar] = await db.execute('SELECT rol FROM kullanıcılar WHERE id = ?', [req.kullanıcı.userId]);
    
    if (kullanıcılar.length === 0) {
      return res.status(404).json({
        başarılı: false,
        mesaj: 'Kullanıcı bulunamadı'
      });
    }
    
    if (kullanıcılar[0].rol === 'admin') {
      return res.status(403).json({
        başarılı: false,
        mesaj: 'Admin kullanıcıları sipariş işlemleri yapamaz'
      });
    }
    
    next();
  } catch (error) {
    console.error('❌ [USERONLY] Hata:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Kullanıcı kontrolü yapılırken hata oluştu'
    });
  }
};

router.post('/', authenticate, userOnly, async (req, res) => {
  try {
    const { adres_id, kupon_kodu, ödeme_yöntemi } = req.body;
    const kullanıcı_id = req.kullanıcı.userId;

    // Sepeti getir
    const [sepet] = await db.execute(
      `SELECT s.*, u.fiyat, u.stok as ürün_stok 
       FROM sepet s 
       JOIN ürünler u ON s.ürün_id = u.id 
       WHERE s.kullanıcı_id = ? AND s.durum = "aktif"`,
      [kullanıcı_id]
    );

    if (sepet.length === 0) {
      return res.status(400).json({
        başarılı: false,
        mesaj: 'Sepetiniz boş'
      });
    }

    // Stok kontrolü
    for (const item of sepet) {
      if (item.ürün_stok < item.adet) {
        return res.status(400).json({
          başarılı: false,
          mesaj: `${item.ürün_ad} için yeterli stok bulunmuyor`
        });
      }
    }

    // Toplam hesapla
    let araToplam = 0;
    sepet.forEach(item => {
      araToplam += item.fiyat * item.adet;
    });

    // Kupon kontrolü
    let indirim = 0;
    if (kupon_kodu) {
      const [kuponlar] = await db.execute(
        'SELECT * FROM kuponlar WHERE kod = ? AND durum = "aktif" AND başlangıç_tarihi <= datetime(\'now\') AND bitiş_tarihi >= datetime(\'now\')',
        [kupon_kodu]
      );
      if (kuponlar.length > 0) {
        const kupon = kuponlar[0];
        if (kupon.tip === 'yüzde') {
          indirim = araToplam * (kupon.değer / 100);
        } else {
          indirim = kupon.değer;
        }
      }
    }

    const toplam = araToplam - indirim;
    const sipariş_numarası = uuidv4().substring(0, 8).toUpperCase();

    // Sipariş oluştur
    const [sipariş] = await db.execute(
      `INSERT INTO siparişler (kullanıcı_id, sipariş_numarası, adres_id, ara_toplam, indirim, toplam, durum, ödeme_yöntemi, oluşturulma_tarihi) 
       VALUES (?, ?, ?, ?, ?, ?, 'beklemede', ?, datetime('now'))`,
      [kullanıcı_id, sipariş_numarası, adres_id, araToplam, indirim, toplam, ödeme_yöntemi]
    );

    const sipariş_id = sipariş.insertId;

    // Sipariş detaylarını ekle
    for (const item of sepet) {
      await db.execute(
        `INSERT INTO sipariş_detayları (sipariş_id, ürün_id, adet, birim_fiyat, toplam_fiyat) 
         VALUES (?, ?, ?, ?, ?)`,
        [sipariş_id, item.ürün_id, item.adet, item.fiyat, item.fiyat * item.adet]
      );

      // Stoktan düş
      await db.execute(
        'UPDATE ürünler SET stok = stok - ? WHERE id = ?',
        [item.adet, item.ürün_id]
      );
    }

    // Sepeti temizle
    await db.execute(
      'UPDATE sepet SET durum = "silindi" WHERE kullanıcı_id = ? AND durum = "aktif"',
      [kullanıcı_id]
    );

    res.status(201).json({
      başarılı: true,
      mesaj: 'Sipariş başarıyla oluşturuldu',
      veri: {
        sipariş_id,
        sipariş_numarası,
        toplam
      }
    });
  } catch (error) {
    console.error('❌ [SİPARİŞLER] Oluşturma hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Sipariş oluşturulurken hata oluştu'
    });
  }
});

router.get('/', authenticate, userOnly, async (req, res) => {
  try {
    const [siparişler] = await db.execute(
      `SELECT s.*, a.adres_başlığı, a.adres, a.şehir, a.posta_kodu 
       FROM siparişler s 
       LEFT JOIN adresler a ON s.adres_id = a.id 
       WHERE s.kullanıcı_id = ? 
       ORDER BY s.oluşturulma_tarihi DESC`,
      [req.kullanıcı.userId]
    );

    res.json({
      başarılı: true,
      veri: siparişler
    });
  } catch (error) {
    console.error('❌ [SİPARİŞLER] Listeleme hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Siparişler listelenirken hata oluştu'
    });
  }
});

router.get('/admin/tümü', authenticate, adminOnly, async (req, res) => {
  try {
    const [siparişler] = await db.execute(
      `SELECT s.*, k.ad, k.soyad, k.email 
       FROM siparişler s 
       JOIN kullanıcılar k ON s.kullanıcı_id = k.id 
       ORDER BY s.oluşturulma_tarihi DESC`
    );

    res.json({
      başarılı: true,
      veri: siparişler
    });
  } catch (error) {
    console.error('Admin sipariş listeleme hatası:', error);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Siparişler listelenirken hata oluştu'
    });
  }
});

router.get('/:id', authenticate, userOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const kullanıcı_id = req.kullanıcı.userId;

    // Sipariş bilgisi
    const [siparişler] = await db.execute(
      `SELECT s.*, a.* 
       FROM siparişler s 
       LEFT JOIN adresler a ON s.adres_id = a.id 
       WHERE s.id = ? AND s.kullanıcı_id = ?`,
      [id, kullanıcı_id]
    );

    if (siparişler.length === 0) {
      return res.status(404).json({
        başarılı: false,
        mesaj: 'Sipariş bulunamadı'
      });
    }

    // Sipariş detayları
    const [detaylar] = await db.execute(
      `SELECT sd.*, u.ad as ürün_ad, u.görseller 
       FROM sipariş_detayları sd 
       JOIN ürünler u ON sd.ürün_id = u.id 
       WHERE sd.sipariş_id = ?`,
      [id]
    );

    res.json({
      başarılı: true,
      veri: {
        ...siparişler[0],
        detaylar
      }
    });
  } catch (error) {
    console.error('❌ [SİPARİŞLER] Detay hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Sipariş detayı alınırken hata oluştu'
    });
  }
});

router.put('/:id/durum', authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { durum } = req.body;

    const geçerliDurumlar = ['beklemede', 'onaylandı', 'hazırlanıyor', 'kargoda', 'teslim_edildi', 'iptal'];
    if (!geçerliDurumlar.includes(durum)) {
      return res.status(400).json({
        başarılı: false,
        mesaj: 'Geçersiz sipariş durumu'
      });
    }

    await db.execute(
      'UPDATE siparişler SET durum = ? WHERE id = ?',
      [durum, id]
    );

    res.json({
      başarılı: true,
      mesaj: 'Sipariş durumu güncellendi'
    });
  } catch (error) {
    console.error('Sipariş durum güncelleme hatası:', error);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Sipariş durumu güncellenirken hata oluştu'
    });
  }
});

module.exports = router;

