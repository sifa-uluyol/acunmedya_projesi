const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Tüm kategorileri listele
router.get('/', async (req, res) => {
  try {
    const [kategoriler] = await db.execute(
      'SELECT * FROM kategoriler WHERE durum = "aktif" ORDER BY ad ASC'
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

// Kategori detayı
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [kategoriler] = await db.execute(
      'SELECT * FROM kategoriler WHERE id = ? AND durum = "aktif"',
      [id]
    );

    if (kategoriler.length === 0) {
      return res.status(404).json({
        başarılı: false,
        mesaj: 'Kategori bulunamadı'
      });
    }

    res.json({
      başarılı: true,
      veri: kategoriler[0]
    });
  } catch (error) {
    console.error('Kategori detay hatası:', error);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Kategori detayı alınırken hata oluştu'
    });
  }
});

module.exports = router;

