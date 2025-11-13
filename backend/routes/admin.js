const express = require('express');
const db = require('../config/database');
const { authenticate, adminOnly } = require('../middleware/auth');
const router = express.Router();

// Dashboard istatistikleri
router.get('/dashboard', authenticate, adminOnly, async (req, res) => {
  try {
    // Toplam sipariş sayısı
    const [toplamSipariş] = await db.execute('SELECT COUNT(*) as toplam FROM siparişler');
    
    // Toplam gelir
    const [toplamGelir] = await db.execute(
      'SELECT SUM(toplam) as toplam FROM siparişler WHERE durum != "iptal"'
    );
    
    // Toplam kullanıcı sayısı
    const [toplamKullanıcı] = await db.execute('SELECT COUNT(*) as toplam FROM kullanıcılar WHERE rol = "user"');
    
    // Toplam ürün sayısı
    const [toplamÜrün] = await db.execute('SELECT COUNT(*) as toplam FROM ürünler WHERE durum = "aktif"');
    
    // Son siparişler
    const [sonSiparişler] = await db.execute(
      `SELECT s.*, k.ad, k.soyad 
       FROM siparişler s 
       JOIN kullanıcılar k ON s.kullanıcı_id = k.id 
       ORDER BY s.oluşturulma_tarihi DESC 
       LIMIT 10`
    );

    // Kategori bazlı satış
    const [kategoriSatış] = await db.execute(
      `SELECT k.ad as kategori, SUM(sd.toplam_fiyat) as toplam 
       FROM sipariş_detayları sd 
       JOIN ürünler u ON sd.ürün_id = u.id 
       JOIN kategoriler k ON u.kategori_id = k.id 
       GROUP BY k.id 
       ORDER BY toplam DESC 
       LIMIT 5`
    );

    res.json({
      başarılı: true,
      veri: {
        istatistikler: {
          toplamSipariş: toplamSipariş[0].toplam,
          toplamGelir: toplamGelir[0].toplam || 0,
          toplamKullanıcı: toplamKullanıcı[0].toplam,
          toplamÜrün: toplamÜrün[0].toplam
        },
        sonSiparişler,
        kategoriSatış
      }
    });
  } catch (error) {
    console.error('Dashboard hatası:', error);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Dashboard verileri alınırken hata oluştu'
    });
  }
});

// Kullanıcı listesi
router.get('/kullanıcılar', authenticate, adminOnly, async (req, res) => {
  try {
    const [kullanıcılar] = await db.execute(
      'SELECT id, email, ad, soyad, rol, durum, oluşturulma_tarihi FROM kullanıcılar ORDER BY oluşturulma_tarihi DESC'
    );

    res.json({
      başarılı: true,
      veri: kullanıcılar
    });
  } catch (error) {
    console.error('Kullanıcı listeleme hatası:', error);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Kullanıcılar listelenirken hata oluştu'
    });
  }
});

// Kullanıcı rolü güncelle
router.put('/kullanıcılar/:id/rol', authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    if (!['user', 'admin'].includes(rol)) {
      return res.status(400).json({
        başarılı: false,
        mesaj: 'Geçersiz rol'
      });
    }

    await db.execute(
      'UPDATE kullanıcılar SET rol = ? WHERE id = ?',
      [rol, id]
    );

    res.json({
      başarılı: true,
      mesaj: 'Kullanıcı rolü güncellendi'
    });
  } catch (error) {
    console.error('Rol güncelleme hatası:', error);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Rol güncellenirken hata oluştu'
    });
  }
});

// Kullanıcı durumu güncelle (aktif/pasif/silindi)
router.put('/kullanıcılar/:id/durum', authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { durum } = req.body;

    if (!['aktif', 'pasif', 'silindi'].includes(durum)) {
      return res.status(400).json({
        başarılı: false,
        mesaj: 'Geçersiz durum'
      });
    }

    await db.execute(
      'UPDATE kullanıcılar SET durum = ? WHERE id = ?',
      [durum, id]
    );

    res.json({
      başarılı: true,
      mesaj: 'Kullanıcı durumu güncellendi'
    });
  } catch (error) {
    console.error('Durum güncelleme hatası:', error);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Durum güncellenirken hata oluştu'
    });
  }
});

// Kategori listesi
router.get('/kategoriler', authenticate, adminOnly, async (req, res) => {
  try {
    const [kategoriler] = await db.execute(
      'SELECT * FROM kategoriler ORDER BY ad ASC'
    );

    res.json({
      başarılı: true,
      veri: kategoriler
    });
  } catch (error) {
    console.error('Kategori listeleme hatası:', error);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Kategoriler listelenirken hata oluştu'
    });
  }
});

// Kategori ekle
router.post('/kategoriler', authenticate, adminOnly, async (req, res) => {
  try {
    const { ad, açıklama, üst_kategori_id } = req.body;

    const [result] = await db.execute(
      `INSERT INTO kategoriler (ad, açıklama, üst_kategori_id, oluşturulma_tarihi) 
       VALUES (?, ?, ?, datetime('now'))`,
      [ad, açıklama, üst_kategori_id || null]
    );

    res.status(201).json({
      başarılı: true,
      mesaj: 'Kategori eklendi',
      veri: { id: result.insertId }
    });
  } catch (error) {
    console.error('Kategori ekleme hatası:', error);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Kategori eklenirken hata oluştu'
    });
  }
});

// Kupon listesi
router.get('/kuponlar', authenticate, adminOnly, async (req, res) => {
  try {
    const [kuponlar] = await db.execute(
      'SELECT * FROM kuponlar ORDER BY oluşturulma_tarihi DESC'
    );

    res.json({
      başarılı: true,
      veri: kuponlar
    });
  } catch (error) {
    console.error('Kupon listeleme hatası:', error);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Kuponlar listelenirken hata oluştu'
    });
  }
});

// Kupon oluştur
router.post('/kuponlar', authenticate, adminOnly, async (req, res) => {
  try {
    const { kod, tip, değer, başlangıç_tarihi, bitiş_tarihi, kullanım_limiti } = req.body;

    const [result] = await db.execute(
      `INSERT INTO kuponlar (kod, tip, değer, başlangıç_tarihi, bitiş_tarihi, kullanım_limiti, oluşturulma_tarihi) 
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
      [kod, tip, değer, başlangıç_tarihi, bitiş_tarihi, kullanım_limiti || null]
    );

    res.status(201).json({
      başarılı: true,
      mesaj: 'Kupon oluşturuldu',
      veri: { id: result.insertId }
    });
  } catch (error) {
    console.error('Kupon oluşturma hatası:', error);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Kupon oluşturulurken hata oluştu'
    });
  }
});

module.exports = router;

