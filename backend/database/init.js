// SQLite veritabanını başlat ve şemayı oluştur
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'acunmedya.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// Veritabanı dosyası yoksa oluştur
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite bağlantı hatası:', err.message);
    process.exit(1);
  }
  console.log('✅ SQLite veritabanı dosyası oluşturuldu/bağlandı');
  
  // Foreign key desteğini aç
  db.run('PRAGMA foreign_keys = ON;');
  
  // Schema'yı oku
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // SQL komutlarını düzgün şekilde ayır
  // BEGIN...END bloklarını koruyarak
  const statements = [];
  let currentStatement = '';
  let inTrigger = false;
  let beginCount = 0;
  
  const lines = schema.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Yorum satırlarını atla
    if (trimmed.startsWith('--') || trimmed === '') {
      continue;
    }
    
    currentStatement += line + '\n';
    
    // BEGIN bulunduğunda trigger içindeyiz
    if (trimmed.toUpperCase().includes('BEGIN') && !trimmed.toUpperCase().includes('CREATE')) {
      inTrigger = true;
      beginCount++;
    }
    
    // END bulunduğunda trigger bitiyor
    if (trimmed.toUpperCase().includes('END') && inTrigger) {
      beginCount--;
      if (beginCount === 0) {
        inTrigger = false;
        // Statement'i ekle (noktalı virgülü kaldır)
        const stmt = currentStatement.trim().replace(/;+$/, '');
        if (stmt) {
          statements.push(stmt);
        }
        currentStatement = '';
        continue;
      }
    }
    
    // Trigger dışındaysa ve noktalı virgül varsa statement bitiyor
    if (!inTrigger && trimmed.endsWith(';')) {
      const stmt = currentStatement.trim().replace(/;+$/, '');
      if (stmt) {
        statements.push(stmt);
      }
      currentStatement = '';
    }
  }
  
  // Son statement'i ekle
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim().replace(/;+$/, ''));
  }
  
  console.log(`📝 ${statements.length} SQL komutu bulundu, çalıştırılıyor...`);
  
  // Tüm komutları sırayla çalıştır
  let completed = 0;
  let hasError = false;
  
  const runNext = (index) => {
    if (hasError || index >= statements.length) {
      if (hasError) {
        console.error('❌ Veritabanı oluşturulurken hata oluştu!');
      } else {
        console.log('✅ Tüm tablolar ve trigger\'lar başarıyla oluşturuldu!');
      }
      db.close();
      return;
    }
    
    const statement = statements[index];
    
    db.run(statement, (err) => {
      if (err) {
        console.error(`❌ Hata (${index + 1}/${statements.length}):`, err.message);
        console.error('Komut:', statement.substring(0, 200));
        hasError = true;
        db.close();
      } else {
        completed++;
        if (index % 5 === 0 || index === statements.length - 1) {
          console.log(`  ✓ ${index + 1}/${statements.length} komut tamamlandı`);
        }
        runNext(index + 1);
      }
    });
  };
  
  runNext(0);
});
