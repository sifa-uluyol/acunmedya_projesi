const express = require('express');
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const [adresler] = await db.execute(
      'SELECT * FROM adresler WHERE kullanıcı_id = ? AND durum = "aktif" ORDER BY varsayılan DESC',
      [req.kullanıcı.userId]
    );

    res.json({
      başarılı: true,
      veri: adresler
    });
  } catch (error) {
    console.error('❌ [ADRESLER] Listeleme hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Adresler listelenirken hata oluştu'
    });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { adres_başlığı, adres, şehir, ilçe, posta_kodu, telefon, varsayılan } = req.body;
    const kullanıcı_id = req.kullanıcı.userId;

    // Eğer varsayılan adres seçildiyse, diğer adresleri varsayılan yapma
    if (varsayılan) {
      await db.execute(
        'UPDATE adresler SET varsayılan = 0 WHERE kullanıcı_id = ?',
        [kullanıcı_id]
      );
    }

    const [result] = await db.execute(
      `INSERT INTO adresler (kullanıcı_id, adres_başlığı, adres, şehir, ilçe, posta_kodu, telefon, varsayılan, oluşturulma_tarihi) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [kullanıcı_id, adres_başlığı, adres, şehir, ilçe, posta_kodu, telefon, varsayılan || 0]
    );

    res.status(201).json({
      başarılı: true,
      mesaj: 'Adres eklendi',
      veri: { id: result.insertId }
    });
  } catch (error) {
    console.error('❌ [ADRESLER] Ekleme hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Adres eklenirken hata oluştu'
    });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { adres_başlığı, adres, şehir, ilçe, posta_kodu, telefon, varsayılan } = req.body;
    const kullanıcı_id = req.kullanıcı.userId;

    // Adresin kullanıcıya ait olduğunu kontrol et
    const [adresler] = await db.execute(
      'SELECT * FROM adresler WHERE id = ? AND kullanıcı_id = ?',
      [id, kullanıcı_id]
    );

    if (adresler.length === 0) {
      return res.status(404).json({
        başarılı: false,
        mesaj: 'Adres bulunamadı'
      });
    }

    // Eğer varsayılan adres seçildiyse, diğer adresleri varsayılan yapma
    if (varsayılan) {
      await db.execute(
        'UPDATE adresler SET varsayılan = 0 WHERE kullanıcı_id = ? AND id != ?',
        [kullanıcı_id, id]
      );
    }

    await db.execute(
      `UPDATE adresler 
       SET adres_başlığı = ?, adres = ?, şehir = ?, ilçe = ?, posta_kodu = ?, telefon = ?, varsayılan = ? 
       WHERE id = ?`,
      [adres_başlığı, adres, şehir, ilçe, posta_kodu, telefon, varsayılan || 0, id]
    );

    res.json({
      başarılı: true,
      mesaj: 'Adres güncellendi'
    });
  } catch (error) {
    console.error('❌ [ADRESLER] Güncelleme hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Adres güncellenirken hata oluştu'
    });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const kullanıcı_id = req.kullanıcı.userId;

    await db.execute(
      'UPDATE adresler SET durum = "silindi" WHERE id = ? AND kullanıcı_id = ?',
      [id, kullanıcı_id]
    );

    res.json({
      başarılı: true,
      mesaj: 'Adres silindi'
    });
  } catch (error) {
    console.error('❌ [ADRESLER] Silme hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Adres silinirken hata oluştu'
    });
  }
});

module.exports = router;

