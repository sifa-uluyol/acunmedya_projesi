-- Örnek veri ekleme scripti (SQLite)

-- Örnek ürünler ekle
INSERT OR IGNORE INTO ürünler (ad, slug, açıklama, kısa_açıklama, fiyat, stok, kategori_id, görseller, etiketler, durum) VALUES
('iPhone 15 Pro', 'iphone-15-pro', 'Apple iPhone 15 Pro 256GB', 'En yeni iPhone modeli', 45999.00, 50, 1, '["https://example.com/iphone1.jpg", "https://example.com/iphone2.jpg"]', 'yeni,popüler', 'aktif'),
('Samsung Galaxy S24', 'samsung-galaxy-s24', 'Samsung Galaxy S24 256GB', 'Güçlü performans', 32999.00, 30, 1, '["https://example.com/samsung1.jpg"]', 'yeni', 'aktif'),
('Nike Air Max', 'nike-air-max', 'Nike Air Max 270 Erkek Spor Ayakkabı', 'Rahat ve şık', 3499.00, 100, 2, '["https://example.com/nike1.jpg"]', 'indirimli', 'aktif'),
('Adidas T-Shirt', 'adidas-t-shirt', 'Adidas Klasik T-Shirt', 'Rahat pamuklu t-shirt', 299.00, 200, 2, '["https://example.com/adidas1.jpg"]', '', 'aktif'),
('Kahve Makinesi', 'kahve-makinesi', 'Delonghi Kahve Makinesi', 'Ev tipi espresso makinesi', 8999.00, 25, 3, '["https://example.com/kahve1.jpg"]', 'popüler', 'aktif');

-- Örnek kuponlar
INSERT OR IGNORE INTO kuponlar (kod, tip, değer, başlangıç_tarihi, bitiş_tarihi, kullanım_limiti, durum) VALUES
('HOŞGELDİN10', 'yüzde', 10.00, datetime('now'), datetime('now', '+30 days'), 100, 'aktif'),
('YENİYIL50', 'sabit', 50.00, datetime('now'), datetime('now', '+7 days'), 50, 'aktif'),
('ÜCRETSİZKARGO', 'sabit', 0.00, datetime('now'), datetime('now', '+60 days'), NULL, 'aktif');
