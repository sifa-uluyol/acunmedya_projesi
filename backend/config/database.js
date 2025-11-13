const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// SQLite veritabanı dosyası yolu
const dbPath = path.join(__dirname, '..', 'database', 'acunmedya.db');

// SQLite veritabanı bağlantısı
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite bağlantı hatası:', err.message);
    return;
  }
  console.log('✅ SQLite veritabanına başarıyla bağlandı!');
  
  // Foreign key desteğini aç
  db.run('PRAGMA foreign_keys = ON;');
});

// Promise tabanlı wrapper fonksiyonlar
const dbPromise = {
  execute: (query, params = []) => {
    return new Promise((resolve, reject) => {
      const upperQuery = query.trim().toUpperCase();
      
      if (upperQuery.startsWith('SELECT')) {
        db.all(query, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve([rows || []]);
          }
        });
      } else if (upperQuery.startsWith('INSERT')) {
        db.run(query, params, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
          }
        });
      } else {
        // UPDATE, DELETE vb.
        db.run(query, params, function(err) {
          if (err) {
            reject(err);
          } else {
            resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
          }
        });
      }
    });
  },
  
  query: (query, params = []) => {
    return dbPromise.execute(query, params);
  }
};

module.exports = dbPromise;
