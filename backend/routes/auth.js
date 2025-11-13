const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken } = require('../config/jwt');
const { validateRegister, validateLogin } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Kullanıcı kayıt
router.post('/kayit', validateRegister, async (req, res) => {
  try {
    const { email, şifre, ad, soyad } = req.body;

    // E-posta kontrolü
    const [existingUser] = await db.execute(
      'SELECT id FROM kullanıcılar WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        başarılı: false,
        mesaj: 'Bu e-posta adresi zaten kullanılıyor'
      });
    }

    // Şifreyi hashle
    const hashlenmişŞifre = await bcrypt.hash(şifre, 10);

    // Kullanıcıyı kaydet
    const [result] = await db.execute(
      `INSERT INTO kullanıcılar (email, şifre, ad, soyad, rol, oluşturulma_tarihi) 
       VALUES (?, ?, ?, ?, 'user', datetime('now'))`,
      [email, hashlenmişŞifre, ad, soyad]
    );

    // Token oluştur
    const token = generateToken(result.insertId, 'user');

    res.status(201).json({
      başarılı: true,
      mesaj: 'Kayıt başarılı',
      veri: {
        token,
        kullanıcı: {
          id: result.insertId,
          email,
          ad,
          soyad,
          rol: 'user'
        }
      }
    });
  } catch (error) {
    console.error('❌ [AUTH] Kayıt hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Kayıt sırasında bir hata oluştu',
      hata: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Kullanıcı giriş
router.post('/giris', validateLogin, async (req, res) => {
  try {
    const { email, şifre } = req.body;

    // Kullanıcıyı bul
    const [users] = await db.execute(
      'SELECT * FROM kullanıcılar WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        başarılı: false,
        mesaj: 'E-posta veya şifre hatalı'
      });
    }

    const kullanıcı = users[0];

    // Hesap durumu kontrolü
    if (kullanıcı.durum === 'pasif' || kullanıcı.durum === 'silindi') {
      return res.status(403).json({
        başarılı: false,
        mesaj: 'Hesabınız devre dışı bırakılmış'
      });
    }

    // Şifre kontrolü
    const şifreDoğru = await bcrypt.compare(şifre, kullanıcı.şifre);
    if (!şifreDoğru) {
      return res.status(401).json({
        başarılı: false,
        mesaj: 'E-posta veya şifre hatalı'
      });
    }

    // Token oluştur
    const token = generateToken(kullanıcı.id, kullanıcı.rol);

    // Son giriş tarihini güncelle
    await db.execute(
      'UPDATE kullanıcılar SET son_giriş_tarihi = datetime(\'now\') WHERE id = ?',
      [kullanıcı.id]
    );

    res.json({
      başarılı: true,
      mesaj: 'Giriş başarılı',
      veri: {
        token,
        kullanıcı: {
          id: kullanıcı.id,
          email: kullanıcı.email,
          ad: kullanıcı.ad,
          soyad: kullanıcı.soyad,
          rol: kullanıcı.rol
        }
      }
    });
  } catch (error) {
    console.error('❌ [AUTH] Giriş hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Giriş sırasında bir hata oluştu'
    });
  }
});

router.get('/profil', authenticate, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, email, ad, soyad, telefon, rol, oluşturulma_tarihi FROM kullanıcılar WHERE id = ?',
      [req.kullanıcı.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        başarılı: false,
        mesaj: 'Kullanıcı bulunamadı'
      });
    }

    res.json({
      başarılı: true,
      veri: users[0]
    });
  } catch (error) {
    console.error('❌ [AUTH] Profil hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Profil bilgileri alınırken hata oluştu'
    });
  }
});

// Profil güncelleme
router.put('/profil', authenticate, async (req, res) => {
  try {
    const { ad, soyad, telefon } = req.body;
    const userId = req.kullanıcı.userId;

    await db.execute(
      'UPDATE kullanıcılar SET ad = ?, soyad = ?, telefon = ? WHERE id = ?',
      [ad, soyad, telefon, userId]
    );

    res.json({
      başarılı: true,
      mesaj: 'Profil başarıyla güncellendi'
    });
  } catch (error) {
    console.error('❌ [AUTH] Profil güncelleme hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Profil güncellenirken hata oluştu'
    });
  }
});

// Şifre değiştirme
router.put('/sifre-degistir', authenticate, async (req, res) => {
  try {
    const { eskiŞifre, yeniŞifre } = req.body;

    if (!yeniŞifre || yeniŞifre.length < 6) {
      return res.status(400).json({
        başarılı: false,
        mesaj: 'Yeni şifre en az 6 karakter olmalıdır'
      });
    }

    // Mevcut şifreyi kontrol et
    const [users] = await db.execute(
      'SELECT şifre FROM kullanıcılar WHERE id = ?',
      [req.kullanıcı.userId]
    );

    const şifreDoğru = await bcrypt.compare(eskiŞifre, users[0].şifre);
    if (!şifreDoğru) {
      return res.status(401).json({
        başarılı: false,
        mesaj: 'Mevcut şifre hatalı'
      });
    }

    // Yeni şifreyi hashle ve güncelle
    const hashlenmişŞifre = await bcrypt.hash(yeniŞifre, 10);
    await db.execute(
      'UPDATE kullanıcılar SET şifre = ? WHERE id = ?',
      [hashlenmişŞifre, req.kullanıcı.userId]
    );

    res.json({
      başarılı: true,
      mesaj: 'Şifre başarıyla değiştirildi'
    });
  } catch (error) {
    console.error('❌ [AUTH] Şifre değiştirme hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Şifre değiştirilirken hata oluştu'
    });
  }
});

// Şifre sıfırlama kodu gönder
router.post('/sifre-sifirla', async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await db.execute(
      'SELECT id, email FROM kullanıcılar WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      // Güvenlik için: Kullanıcı yoksa da başarılı mesajı dön
      return res.json({
        başarılı: true,
        mesaj: 'Eğer bu e-posta kayıtlıysa, şifre sıfırlama kodu gönderildi'
      });
    }

    // 6 haneli kod oluştur
    const kod = Math.floor(100000 + Math.random() * 900000).toString();
    const süre = new Date();
    süre.setHours(süre.getHours() + 1); // 1 saat geçerli

    await db.execute(
      'UPDATE kullanıcılar SET şifre_sıfırlama_kodu = ?, şifre_sıfırlama_süresi = ? WHERE email = ?',
      [kod, süre, email]
    );

    // E-posta gönder (opsiyonel - şimdilik log)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔑 [AUTH] Şifre sıfırlama kodu (${email}): ${kod}`);
    }

    res.json({
      başarılı: true,
      mesaj: 'Şifre sıfırlama kodu e-posta adresinize gönderildi'
    });
  } catch (error) {
    console.error('❌ [AUTH] Şifre sıfırlama hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Şifre sıfırlama kodu gönderilirken hata oluştu'
    });
  }
});

// Şifre sıfırlama kodunu doğrula ve şifreyi değiştir
router.post('/sifre-yenile', async (req, res) => {
  try {
    const { email, kod, yeniŞifre } = req.body;

    if (!yeniŞifre || yeniŞifre.length < 6) {
      return res.status(400).json({
        başarılı: false,
        mesaj: 'Yeni şifre en az 6 karakter olmalıdır'
      });
    }

    const [users] = await db.execute(
      'SELECT id, şifre_sıfırlama_kodu, şifre_sıfırlama_süresi FROM kullanıcılar WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        başarılı: false,
        mesaj: 'Kullanıcı bulunamadı'
      });
    }

    const kullanıcı = users[0];

    // Kod kontrolü
    if (kullanıcı.şifre_sıfırlama_kodu !== kod) {
      return res.status(400).json({
        başarılı: false,
        mesaj: 'Geçersiz kod'
      });
    }

    // Süre kontrolü
    if (!kullanıcı.şifre_sıfırlama_süresi || new Date(kullanıcı.şifre_sıfırlama_süresi) < new Date()) {
      return res.status(400).json({
        başarılı: false,
        mesaj: 'Kodun süresi dolmuş'
      });
    }

    // Şifreyi güncelle
    const hashlenmişŞifre = await bcrypt.hash(yeniŞifre, 10);
    await db.execute(
      'UPDATE kullanıcılar SET şifre = ?, şifre_sıfırlama_kodu = NULL, şifre_sıfırlama_süresi = NULL WHERE email = ?',
      [hashlenmişŞifre, email]
    );

    res.json({
      başarılı: true,
      mesaj: 'Şifreniz başarıyla değiştirildi'
    });
  } catch (error) {
    console.error('❌ [AUTH] Şifre yenileme hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'Şifre değiştirilirken hata oluştu'
    });
  }
});

// E-posta doğrulama kodu gönder
router.post('/email-dogrula', authenticate, async (req, res) => {
  try {
    const userId = req.kullanıcı.userId;
    const [users] = await db.execute(
      'SELECT email, email_doğrulandı FROM kullanıcılar WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        başarılı: false,
        mesaj: 'Kullanıcı bulunamadı'
      });
    }

    if (users[0].email_doğrulandı) {
      return res.json({
        başarılı: true,
        mesaj: 'E-posta adresi zaten doğrulanmış'
      });
    }

    // 6 haneli kod oluştur
    const kod = Math.floor(100000 + Math.random() * 900000).toString();

    await db.execute(
      'UPDATE kullanıcılar SET email_doğrulama_kodu = ? WHERE id = ?',
      [kod, userId]
    );

    // E-posta gönder (opsiyonel - şimdilik log)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 [AUTH] E-posta doğrulama kodu (${users[0].email}): ${kod}`);
    }

    res.json({
      başarılı: true,
      mesaj: 'E-posta doğrulama kodu gönderildi'
    });
  } catch (error) {
    console.error('❌ [AUTH] E-posta doğrulama hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'E-posta doğrulama kodu gönderilirken hata oluştu'
    });
  }
});

// E-posta doğrulama kodunu kontrol et
router.post('/email-dogrula-kod', authenticate, async (req, res) => {
  try {
    const { kod } = req.body;
    const userId = req.kullanıcı.userId;

    const [users] = await db.execute(
      'SELECT email_doğrulama_kodu FROM kullanıcılar WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        başarılı: false,
        mesaj: 'Kullanıcı bulunamadı'
      });
    }

    if (users[0].email_doğrulama_kodu !== kod) {
      return res.status(400).json({
        başarılı: false,
        mesaj: 'Geçersiz kod'
      });
    }

    await db.execute(
      'UPDATE kullanıcılar SET email_doğrulandı = TRUE, email_doğrulama_kodu = NULL WHERE id = ?',
      [userId]
    );

    res.json({
      başarılı: true,
      mesaj: 'E-posta adresi başarıyla doğrulandı'
    });
  } catch (error) {
    console.error('❌ [AUTH] E-posta doğrulama hatası:', error.message);
    res.status(500).json({
      başarılı: false,
      mesaj: 'E-posta doğrulanırken hata oluştu'
    });
  }
});

module.exports = router;

