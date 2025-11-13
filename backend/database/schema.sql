-- Acunmedya E-Ticaret Veritabanı Şeması
-- SQLite 3

-- Foreign key desteğini aç
PRAGMA foreign_keys = ON;

-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS kullanıcılar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  şifre TEXT NOT NULL,
  ad TEXT NOT NULL,
  soyad TEXT NOT NULL,
  telefon TEXT,
  rol TEXT DEFAULT 'user' CHECK(rol IN ('user', 'admin')),
  durum TEXT DEFAULT 'aktif' CHECK(durum IN ('aktif', 'pasif', 'silindi')),
  email_doğrulandı INTEGER DEFAULT 0,
  email_doğrulama_kodu TEXT,
  şifre_sıfırlama_kodu TEXT,
  şifre_sıfırlama_süresi TEXT,
  oluşturulma_tarihi TEXT DEFAULT (datetime('now')),
  güncellenme_tarihi TEXT DEFAULT (datetime('now')),
  son_giriş_tarihi TEXT
);

CREATE INDEX IF NOT EXISTS idx_email ON kullanıcılar(email);
CREATE INDEX IF NOT EXISTS idx_rol ON kullanıcılar(rol);

-- Kategoriler tablosu
CREATE TABLE IF NOT EXISTS kategoriler (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ad TEXT NOT NULL,
  açıklama TEXT,
  slug TEXT UNIQUE,
  üst_kategori_id INTEGER,
  görsel TEXT,
  durum TEXT DEFAULT 'aktif' CHECK(durum IN ('aktif', 'pasif', 'silindi')),
  sıralama INTEGER DEFAULT 0,
  oluşturulma_tarihi TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (üst_kategori_id) REFERENCES kategoriler(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_slug ON kategoriler(slug);
CREATE INDEX IF NOT EXISTS idx_durum ON kategoriler(durum);

-- Ürünler tablosu
CREATE TABLE IF NOT EXISTS ürünler (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ad TEXT NOT NULL,
  slug TEXT UNIQUE,
  açıklama TEXT,
  kısa_açıklama TEXT,
  fiyat REAL NOT NULL,
  indirimli_fiyat REAL,
  stok INTEGER DEFAULT 0,
  kategori_id INTEGER,
  görseller TEXT, -- JSON string olarak saklanacak
  etiketler TEXT,
  durum TEXT DEFAULT 'aktif' CHECK(durum IN ('aktif', 'pasif', 'silindi')),
  seo_başlık TEXT,
  seo_açıklama TEXT,
  görüntülenme_sayısı INTEGER DEFAULT 0,
  satış_sayısı INTEGER DEFAULT 0,
  oluşturulma_tarihi TEXT DEFAULT (datetime('now')),
  güncellenme_tarihi TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (kategori_id) REFERENCES kategoriler(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_slug ON ürünler(slug);
CREATE INDEX IF NOT EXISTS idx_kategori ON ürünler(kategori_id);
CREATE INDEX IF NOT EXISTS idx_durum ON ürünler(durum);
CREATE INDEX IF NOT EXISTS idx_fiyat ON ürünler(fiyat);

-- Ürün varyantları tablosu
CREATE TABLE IF NOT EXISTS ürün_varyantları (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ürün_id INTEGER NOT NULL,
  varyant_tipi TEXT NOT NULL,
  varyant_değeri TEXT NOT NULL,
  fiyat_farkı REAL DEFAULT 0,
  stok INTEGER DEFAULT 0,
  görsel TEXT,
  oluşturulma_tarihi TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (ürün_id) REFERENCES ürünler(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ürün ON ürün_varyantları(ürün_id);

-- Adresler tablosu
CREATE TABLE IF NOT EXISTS adresler (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kullanıcı_id INTEGER NOT NULL,
  adres_başlığı TEXT NOT NULL,
  adres TEXT NOT NULL,
  şehir TEXT NOT NULL,
  ilçe TEXT,
  posta_kodu TEXT,
  telefon TEXT,
  varsayılan INTEGER DEFAULT 0,
  durum TEXT DEFAULT 'aktif' CHECK(durum IN ('aktif', 'silindi')),
  oluşturulma_tarihi TEXT DEFAULT (datetime('now')),
  güncellenme_tarihi TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (kullanıcı_id) REFERENCES kullanıcılar(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_kullanıcı ON adresler(kullanıcı_id);

-- Sepet tablosu
CREATE TABLE IF NOT EXISTS sepet (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kullanıcı_id INTEGER NOT NULL,
  ürün_id INTEGER NOT NULL,
  varyant_id INTEGER,
  adet INTEGER NOT NULL DEFAULT 1,
  durum TEXT DEFAULT 'aktif' CHECK(durum IN ('aktif', 'silindi')),
  oluşturulma_tarihi TEXT DEFAULT (datetime('now')),
  güncellenme_tarihi TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (kullanıcı_id) REFERENCES kullanıcılar(id) ON DELETE CASCADE,
  FOREIGN KEY (ürün_id) REFERENCES ürünler(id) ON DELETE CASCADE,
  FOREIGN KEY (varyant_id) REFERENCES ürün_varyantları(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_kullanıcı ON sepet(kullanıcı_id);
CREATE INDEX IF NOT EXISTS idx_durum ON sepet(durum);

-- Kuponlar tablosu
CREATE TABLE IF NOT EXISTS kuponlar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kod TEXT UNIQUE NOT NULL,
  tip TEXT NOT NULL CHECK(tip IN ('yüzde', 'sabit')),
  değer REAL NOT NULL,
  başlangıç_tarihi TEXT NOT NULL,
  bitiş_tarihi TEXT NOT NULL,
  kullanım_limiti INTEGER,
  kullanım_sayısı INTEGER DEFAULT 0,
  minimum_tutar REAL DEFAULT 0,
  durum TEXT DEFAULT 'aktif' CHECK(durum IN ('aktif', 'pasif', 'silindi')),
  oluşturulma_tarihi TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_kod ON kuponlar(kod);
CREATE INDEX IF NOT EXISTS idx_durum ON kuponlar(durum);

-- Siparişler tablosu
CREATE TABLE IF NOT EXISTS siparişler (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kullanıcı_id INTEGER NOT NULL,
  sipariş_numarası TEXT UNIQUE NOT NULL,
  adres_id INTEGER NOT NULL,
  ara_toplam REAL NOT NULL,
  indirim REAL DEFAULT 0,
  kargo_ücreti REAL DEFAULT 0,
  toplam REAL NOT NULL,
  durum TEXT DEFAULT 'beklemede' CHECK(durum IN ('beklemede', 'onaylandı', 'hazırlanıyor', 'kargoda', 'teslim_edildi', 'iptal')),
  ödeme_yöntemi TEXT,
  ödeme_durumu TEXT DEFAULT 'beklemede' CHECK(ödeme_durumu IN ('beklemede', 'tamamlandı', 'başarısız', 'iade')),
  ödeme_id TEXT,
  kargo_takip_no TEXT,
  notlar TEXT,
  oluşturulma_tarihi TEXT DEFAULT (datetime('now')),
  güncellenme_tarihi TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (kullanıcı_id) REFERENCES kullanıcılar(id),
  FOREIGN KEY (adres_id) REFERENCES adresler(id)
);

CREATE INDEX IF NOT EXISTS idx_kullanıcı ON siparişler(kullanıcı_id);
CREATE INDEX IF NOT EXISTS idx_sipariş_numarası ON siparişler(sipariş_numarası);
CREATE INDEX IF NOT EXISTS idx_durum ON siparişler(durum);

-- Sipariş detayları tablosu
CREATE TABLE IF NOT EXISTS sipariş_detayları (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sipariş_id INTEGER NOT NULL,
  ürün_id INTEGER NOT NULL,
  varyant_id INTEGER,
  adet INTEGER NOT NULL,
  birim_fiyat REAL NOT NULL,
  toplam_fiyat REAL NOT NULL,
  oluşturulma_tarihi TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (sipariş_id) REFERENCES siparişler(id) ON DELETE CASCADE,
  FOREIGN KEY (ürün_id) REFERENCES ürünler(id),
  FOREIGN KEY (varyant_id) REFERENCES ürün_varyantları(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_sipariş ON sipariş_detayları(sipariş_id);

-- Admin işlem logları tablosu
CREATE TABLE IF NOT EXISTS admin_logları (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kullanıcı_id INTEGER NOT NULL,
  işlem_tipi TEXT NOT NULL,
  işlem_detayı TEXT,
  ip_adresi TEXT,
  oluşturulma_tarihi TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (kullanıcı_id) REFERENCES kullanıcılar(id)
);

CREATE INDEX IF NOT EXISTS idx_kullanıcı ON admin_logları(kullanıcı_id);
CREATE INDEX IF NOT EXISTS idx_tarih ON admin_logları(oluşturulma_tarihi);

-- Güncellenme tarihi için trigger'lar
CREATE TRIGGER IF NOT EXISTS kullanıcılar_güncelle AFTER UPDATE ON kullanıcılar
BEGIN
  UPDATE kullanıcılar SET güncellenme_tarihi = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS ürünler_güncelle AFTER UPDATE ON ürünler
BEGIN
  UPDATE ürünler SET güncellenme_tarihi = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS adresler_güncelle AFTER UPDATE ON adresler
BEGIN
  UPDATE adresler SET güncellenme_tarihi = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS sepet_güncelle AFTER UPDATE ON sepet
BEGIN
  UPDATE sepet SET güncellenme_tarihi = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS siparişler_güncelle AFTER UPDATE ON siparişler
BEGIN
  UPDATE siparişler SET güncellenme_tarihi = datetime('now') WHERE id = NEW.id;
END;

-- Örnek kategoriler
INSERT OR IGNORE INTO kategoriler (ad, slug, durum) VALUES
('Elektronik', 'elektronik', 'aktif'),
('Giyim', 'giyim', 'aktif'),
('Ev & Yaşam', 'ev-yasam', 'aktif'),
('Kitap', 'kitap', 'aktif'),
('Spor & Outdoor', 'spor-outdoor', 'aktif');
