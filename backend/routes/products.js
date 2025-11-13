const express = require('express');
const db = require('../config/database');
const { authenticate, adminOnly } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');
const router = express.Router();

// Tüm ürünleri listele (filtreleme ve sıralama ile)
router.get('/', async (req, res) => {
  try {
    const { kategori, minFiyat, maxFiyat, stokta, etiket, sıralama, arama, sayfa = 1, limit = 20 } = req.query;
    
    let sorgu = 'SELECT * FROM ürünler WHERE durum = "aktif"';
    const parametreler = [];

    // Arama
    if (arama) {
      sorgu += ' AND (ad LIKE ? OR açıklama LIKE ?)';
      const aramaParametresi = `%${arama}%`;
      parametreler.push(aramaParametresi, aramaParametresi);
    }

    // Kategori filtresi
    if (kategori) {
      sorgu += ' AND kategori_id = ?';
      parametreler.push(kategori);
    }

    // Fiyat aralığı
    if (minFiyat) {
      sorgu += ' AND fiyat >= ?';
      parametreler.push(minFiyat);
    }
    if (maxFiyat) {
      sorgu += ' AND fiyat <= ?';
      parametreler.push(maxFiyat);
    }

    // Stokta olanlar
    if (stokta === 'true') {
      sorgu += ' AND stok > 0';
    }

    // Etiket filtresi
    if (etiket) {
      sorgu += ' AND etiketler LIKE ?';
      parametreler.push(`%${etiket}%`);
    }

    // Sıralama
    const sıralamaSeçenekleri = {
      'fiyat-artan': 'fiyat ASC',
      'fiyat-azalan': 'fiyat DESC',
      'yeni': 'oluşturulma_tarihi DESC',
      'eski': 'oluşturulma_tarihi ASC',
      'ad': 'ad ASC'
    };
    sorgu += ` ORDER BY ${sıralamaSeçenekleri[sıralama] || 'oluşturulma_tarihi DESC'}`;

    // Sayfalama
    const offset = (sayfa - 1) * limit;
    sorgu += ' LIMIT ? OFFSET ?';
    parametreler.push(parseInt(limit), offset);

    const [ürünler] = await db.execute(sorgu, parametreler);

    // Görselleri parse et
    ürünler.forEach(ürün => {
      if (ürün.görseller && typeof ürün.görseller === 'string') {
        try {
          ürün.görseller = JSON.parse(ürün.görseller);
        } catch (e) {
          ürün.görseller = [];
        }
      }
    });

    // Toplam sayı
    let saymaSorgusu = 'SELECT COUNT(*) as toplam FROM ürünler WHERE durum = "aktif"';
    const saymaParametreleri = [];
    
    if (arama) {
      saymaSorgusu += ' AND (ad LIKE ? OR açıklama LIKE ?)';
      const aramaParametresi = `%${arama}%`;
      saymaParametreleri.push(aramaParametresi, aramaParametresi);
    }
    if (kategori) {
      saymaSorgusu += ' AND kategori_id = ?';
      saymaParametreleri.push(kategori);
    }
    if (minFiyat) {
      saymaSorgusu += ' AND fiyat >= ?';
      saymaParametreleri.push(minFiyat);
    }
    if (maxFiyat) {
      saymaSorgusu += ' AND fiyat <= ?';
      saymaParametreleri.push(maxFiyat);
    }
    if (stokta === 'true') {
      saymaSorgusu += ' AND stok > 0';
    }

    const [toplam] = await db.execute(saymaSorgusu, saymaParametreleri);

    res.json({
      başarılı: true,
      veri: {
        ürünler,
        sayfalama: {
          sayfa: parseInt(sayfa),
          limit: parseInt(limit),
          toplam: toplam[0].toplam,
          toplamSayfa: Math.ceil(toplam[0].toplam / limit)
        }
      }
    });
  } catch (error) {
    console.error('Ürün listeleme hatası:', error);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Ürünler listelenirken hata oluştu'
    });
  }
});

// Ürün detayı
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [ürünler] = await db.execute(
      `SELECT u.*, k.ad as kategori_ad 
       FROM ürünler u 
       LEFT JOIN kategoriler k ON u.kategori_id = k.id 
       WHERE u.id = ? AND u.durum = "aktif"`,
      [id]
    );

    if (ürünler.length === 0) {
      return res.status(404).json({
        başarılı: false,
        mesaj: 'Ürün bulunamadı'
      });
    }

    const ürün = ürünler[0];
    
    // Görselleri parse et
    if (ürün.görseller && typeof ürün.görseller === 'string') {
      try {
        ürün.görseller = JSON.parse(ürün.görseller);
      } catch (e) {
        ürün.görseller = [];
      }
    }

    // Ürün varyantlarını getir
    const [varyantlar] = await db.execute(
      'SELECT * FROM ürün_varyantları WHERE ürün_id = ?',
      [id]
    );

    // Benzer ürünleri getir
    const [benzerÜrünler] = await db.execute(
      `SELECT * FROM ürünler 
       WHERE kategori_id = ? AND id != ? AND durum = "aktif" 
       LIMIT 4`,
      [ürün.kategori_id, id]
    );

    // Benzer ürünlerin görsellerini parse et
    benzerÜrünler.forEach(benzer => {
      if (benzer.görseller && typeof benzer.görseller === 'string') {
        try {
          benzer.görseller = JSON.parse(benzer.görseller);
        } catch (e) {
          benzer.görseller = [];
        }
      }
    });

    res.json({
      başarılı: true,
      veri: {
        ...ürün,
        varyantlar,
        benzerÜrünler
      }
    });
  } catch (error) {
    console.error('Ürün detay hatası:', error);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Ürün detayı alınırken hata oluştu'
    });
  }
});

// Ürün ekle (Admin)
router.post('/', authenticate, adminOnly, validateProduct, async (req, res) => {
  try {
    const { ad, açıklama, fiyat, stok, kategori_id, etiketler, görseller } = req.body;

    const [result] = await db.execute(
      `INSERT INTO ürünler (ad, açıklama, fiyat, stok, kategori_id, etiketler, görseller, oluşturulma_tarihi) 
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [ad, açıklama, fiyat, stok, kategori_id, etiketler, JSON.stringify(görseller || [])]
    );

    res.status(201).json({
      başarılı: true,
      mesaj: 'Ürün başarıyla eklendi',
      veri: { id: result.insertId }
    });
  } catch (error) {
    console.error('Ürün ekleme hatası:', error);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Ürün eklenirken hata oluştu'
    });
  }
});

// Ürün güncelle (Admin)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { ad, açıklama, fiyat, stok, kategori_id, etiketler, görseller, durum } = req.body;

    await db.execute(
      `UPDATE ürünler 
       SET ad = ?, açıklama = ?, fiyat = ?, stok = ?, kategori_id = ?, 
           etiketler = ?, görseller = ?, durum = ?, güncellenme_tarihi = datetime('now') 
       WHERE id = ?`,
      [ad, açıklama, fiyat, stok, kategori_id, etiketler, JSON.stringify(görseller || []), durum, id]
    );

    res.json({
      başarılı: true,
      mesaj: 'Ürün başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Ürün güncelleme hatası:', error);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Ürün güncellenirken hata oluştu'
    });
  }
});

// Ürün sil (Admin)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    await db.execute(
      'UPDATE ürünler SET durum = "silindi" WHERE id = ?',
      [id]
    );

    res.json({
      başarılı: true,
      mesaj: 'Ürün başarıyla silindi'
    });
  } catch (error) {
    console.error('Ürün silme hatası:', error);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Ürün silinirken hata oluştu'
    });
  }
});

module.exports = router;

