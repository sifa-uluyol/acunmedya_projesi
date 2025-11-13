const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
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
        mesaj: 'Admin kullanıcıları sepet işlemleri yapamaz'
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

router.get('/', authenticate, userOnly, async (req, res) => {
  try {
    const [sepet] = await db.execute(
      `SELECT s.*, u.ad as ürün_ad, u.fiyat, u.görseller, u.stok 
       FROM sepet s 
       JOIN ürünler u ON s.ürün_id = u.id 
       WHERE s.kullanıcı_id = ? AND s.durum = "aktif"`,
      [req.kullanıcı.userId]
    );

    let toplam = 0;
    sepet.forEach(item => {
      toplam += item.fiyat * item.adet;
    });

    res.json({
      başarılı: true,
      veri: {
        sepet,
        toplam: toplam.toFixed(2)
      }
    });
  } catch (error) {
    console.error('❌ [SEPET] Hata:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Sepet bilgileri alınırken hata oluştu'
    });
  }
});

router.post('/ekle', authenticate, userOnly, async (req, res) => {
  try {
    const { ürün_id, adet = 1, varyant_id } = req.body;
    const kullanıcı_id = req.kullanıcı.userId;

    // Ürün kontrolü
    const [ürünler] = await db.execute(
      'SELECT * FROM ürünler WHERE id = ? AND durum = "aktif"',
      [ürün_id]
    );

    if (ürünler.length === 0) {
      return res.status(404).json({
        başarılı: false,
        mesaj: 'Ürün bulunamadı'
      });
    }

    const ürün = ürünler[0];

    // Stok kontrolü
    if (ürün.stok < adet) {
      return res.status(400).json({
        başarılı: false,
        mesaj: 'Yeterli stok bulunmuyor'
      });
    }

    // Sepette aynı ürün var mı kontrol et
    const [mevcutSepet] = await db.execute(
      'SELECT * FROM sepet WHERE kullanıcı_id = ? AND ürün_id = ? AND varyant_id = ? AND durum = "aktif"',
      [kullanıcı_id, ürün_id, varyant_id || null]
    );

    if (mevcutSepet.length > 0) {
      // Mevcut ürünün adedini artır
      const yeniAdet = mevcutSepet[0].adet + adet;
      await db.execute(
        'UPDATE sepet SET adet = ? WHERE id = ?',
        [yeniAdet, mevcutSepet[0].id]
      );
    } else {
      // Yeni ürün ekle
      await db.execute(
        `INSERT INTO sepet (kullanıcı_id, ürün_id, adet, varyant_id, oluşturulma_tarihi) 
         VALUES (?, ?, ?, ?, datetime('now'))`,
        [kullanıcı_id, ürün_id, adet, varyant_id || null]
      );
    }

    res.json({
      başarılı: true,
      mesaj: 'Ürün sepete eklendi'
    });
  } catch (error) {
    console.error('❌ [SEPET] Ekleme hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Ürün sepete eklenirken hata oluştu'
    });
  }
});

router.delete('/çıkar/:id', authenticate, userOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const kullanıcı_id = req.kullanıcı.userId;

    await db.execute(
      'UPDATE sepet SET durum = "silindi" WHERE id = ? AND kullanıcı_id = ?',
      [id, kullanıcı_id]
    );

    res.json({
      başarılı: true,
      mesaj: 'Ürün sepetten çıkarıldı'
    });
  } catch (error) {
    console.error('❌ [SEPET] Çıkarma hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Ürün sepetten çıkarılırken hata oluştu'
    });
  }
});

router.put('/güncelle/:id', authenticate, userOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { adet } = req.body;
    const kullanıcı_id = req.kullanıcı.userId;

    if (adet <= 0) {
      return res.status(400).json({
        başarılı: false,
        mesaj: 'Adet 0\'dan büyük olmalıdır'
      });
    }

    // Stok kontrolü
    const [sepet] = await db.execute(
      `SELECT s.*, u.stok 
       FROM sepet s 
       JOIN ürünler u ON s.ürün_id = u.id 
       WHERE s.id = ? AND s.kullanıcı_id = ?`,
      [id, kullanıcı_id]
    );

    if (sepet.length === 0) {
      return res.status(404).json({
        başarılı: false,
        mesaj: 'Sepet öğesi bulunamadı'
      });
    }

    if (sepet[0].stok < adet) {
      return res.status(400).json({
        başarılı: false,
        mesaj: 'Yeterli stok bulunmuyor'
      });
    }

    await db.execute(
      'UPDATE sepet SET adet = ? WHERE id = ?',
      [adet, id]
    );

    res.json({
      başarılı: true,
      mesaj: 'Sepet güncellendi'
    });
  } catch (error) {
    console.error('❌ [SEPET] Güncelleme hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Sepet güncellenirken hata oluştu'
    });
  }
});

router.delete('/temizle', authenticate, userOnly, async (req, res) => {
  try {
    await db.execute(
      'UPDATE sepet SET durum = "silindi" WHERE kullanıcı_id = ?',
      [req.kullanıcı.userId]
    );

    res.json({
      başarılı: true,
      mesaj: 'Sepet temizlendi'
    });
  } catch (error) {
    console.error('❌ [SEPET] Temizleme hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Sepet temizlenirken hata oluştu'
    });
  }
});

module.exports = router;

