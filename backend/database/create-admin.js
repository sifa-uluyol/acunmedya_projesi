// Admin kullanıcısı oluşturma scripti
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'acunmedya.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite bağlantı hatası:', err.message);
    process.exit(1);
  }
  console.log('✅ SQLite veritabanına bağlandı');
  
  // Admin kullanıcısı oluştur
  createAdmin();
});

async function createAdmin() {
  const adminEmail = 'admin@acunmedya.com';
  const adminPassword = 'admin123'; // Varsayılan şifre
  const adminAd = 'Admin';
  const adminSoyad = 'Kullanıcı';
  
  // Önce admin kullanıcısı var mı kontrol et
  db.get('SELECT id FROM kullanıcılar WHERE email = ?', [adminEmail], async (err, row) => {
    if (err) {
      console.error('❌ Hata:', err.message);
      db.close();
      return;
    }
    
    if (row) {
      console.log('ℹ️  Admin kullanıcısı zaten mevcut!');
      console.log('📧 E-posta:', adminEmail);
      console.log('🔑 Şifre:', adminPassword);
      db.close();
      return;
    }
    
    // Şifreyi hashle
    const hashlenmişŞifre = await bcrypt.hash(adminPassword, 10);
    
    // Admin kullanıcısını oluştur
    db.run(
      `INSERT INTO kullanıcılar (email, şifre, ad, soyad, rol, durum, oluşturulma_tarihi) 
       VALUES (?, ?, ?, ?, 'admin', 'aktif', datetime('now'))`,
      [adminEmail, hashlenmişŞifre, adminAd, adminSoyad],
      function(err) {
        if (err) {
          console.error('❌ Admin kullanıcısı oluşturulurken hata:', err.message);
          db.close();
          return;
        }
        
        console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
        console.log('');
        console.log('📧 E-posta:', adminEmail);
        console.log('🔑 Şifre:', adminPassword);
        console.log('');
        console.log('⚠️  GÜVENLİK: İlk girişten sonra şifrenizi değiştirmeyi unutmayın!');
        db.close();
      }
    );
  });
}

