# Acunmedya Backend API

E-ticaret platformu için Node.js + Express + SQLite backend API'si.

## Kurulum

1. Bağımlılıkları yükleyin:
```bash
npm install
```

2. `.env` dosyası oluşturun:
```bash
cp .env.example .env
```

3. `.env` dosyasını düzenleyin ve veritabanı bilgilerinizi girin.

4. SQLite veritabanını oluşturun:
```bash
npm run init-db
```

Bu komut `database/acunmedya.db` dosyasını oluşturur ve tüm tabloları kurar.

6. Sunucuyu başlatın:
```bash
# Geliştirme modu
npm run dev

# Production modu
npm start
```

## API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/kayit` - Kullanıcı kaydı
- `POST /api/auth/giris` - Kullanıcı girişi
- `GET /api/auth/profil` - Profil bilgileri
- `PUT /api/auth/profil` - Profil güncelleme
- `PUT /api/auth/sifre-degistir` - Şifre değiştirme

### Ürünler
- `GET /api/ürünler` - Ürün listesi (filtreleme, sıralama)
- `GET /api/ürünler/:id` - Ürün detayı
- `POST /api/ürünler` - Ürün ekle (Admin)
- `PUT /api/ürünler/:id` - Ürün güncelle (Admin)
- `DELETE /api/ürünler/:id` - Ürün sil (Admin)

### Sepet
- `GET /api/sepet` - Sepeti getir
- `POST /api/sepet/ekle` - Sepete ürün ekle
- `PUT /api/sepet/güncelle/:id` - Sepet adedi güncelle
- `DELETE /api/sepet/çıkar/:id` - Sepetten ürün çıkar
- `DELETE /api/sepet/temizle` - Sepeti temizle

### Siparişler
- `POST /api/siparişler` - Sipariş oluştur
- `GET /api/siparişler` - Kullanıcının siparişleri
- `GET /api/siparişler/:id` - Sipariş detayı
- `PUT /api/siparişler/:id/durum` - Sipariş durumu güncelle (Admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard istatistikleri
- `GET /api/admin/kullanıcılar` - Kullanıcı listesi
- `PUT /api/admin/kullanıcılar/:id/rol` - Kullanıcı rolü güncelle
- `GET /api/admin/kategoriler` - Kategori listesi
- `POST /api/admin/kategoriler` - Kategori ekle
- `POST /api/admin/kuponlar` - Kupon oluştur

### Adresler
- `GET /api/adresler` - Adres listesi
- `POST /api/adresler` - Yeni adres ekle
- `PUT /api/adresler/:id` - Adres güncelle
- `DELETE /api/adresler/:id` - Adres sil

### Kategoriler
- `GET /api/kategoriler` - Kategori listesi
- `GET /api/kategoriler/:id` - Kategori detayı

## Güvenlik

- JWT token tabanlı kimlik doğrulama
- Bcrypt ile şifre hashleme
- Rate limiting
- Helmet.js ile güvenlik başlıkları
- CORS yapılandırması
- Input validation

## Notlar

- Tüm API yanıtları Türkçe karakterler içerir
- Tarih formatları ISO 8601 standardında
- Hata mesajları Türkçe'dir

