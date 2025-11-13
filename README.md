# Acunmedya E-Ticaret Platformu

Modern, tam özellikli e-ticaret platformu. Node.js + Express + SQLite backend ve Next.js frontend ile geliştirilmiştir.

## Özellikler

### Kullanıcı Yönetimi
- ✅ Kullanıcı kayıt ve giriş (JWT)
- ✅ Şifre sıfırlama
- ✅ Profil yönetimi
- ✅ Adres yönetimi
- ✅ Sipariş geçmişi
- ✅ Rol bazlı yetkilendirme (admin/user)

### Ürün Yönetimi
- ✅ Ürün CRUD işlemleri
- ✅ Kategori yönetimi
- ✅ Ürün varyantları (renk, beden)
- ✅ Görsel yükleme desteği
- ✅ Filtreleme ve sıralama
- ✅ Arama özelliği

### Sepet Yönetimi
- ✅ Giriş yapmadan sepet kullanımı (localStorage)
- ✅ Backend ile senkronizasyon
- ✅ Stok kontrolü
- ✅ Kupon/indirim kodu desteği

### Sipariş Sistemi
- ✅ Sipariş oluşturma
- ✅ Sipariş durumu takibi
- ✅ Ödeme entegrasyonu hazır
- ✅ E-posta bildirimleri

### Admin Paneli
- ✅ Dashboard ve istatistikler
- ✅ Kullanıcı yönetimi
- ✅ Ürün yönetimi
- ✅ Sipariş yönetimi
- ✅ Kategori yönetimi
- ✅ Kupon yönetimi

## Kurulum

### Gereksinimler
- Node.js 18+
- SQLite 3 (otomatik yüklenir)
- npm veya yarn

### Backend Kurulumu

```bash
cd backend
npm install
npm run init-db  # Veritabanını oluştur
npm run dev
```

**Not:** SQLite kullanıyoruz, ekstra veritabanı kurulumu gerekmiyor! `.env` dosyası da opsiyonel.

### Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

## Veritabanı

Proje **SQLite** kullanıyor. Veritabanı dosyası: `backend/database/acunmedya.db`

Veritabanını oluşturmak için:
```bash
cd backend
npm run init-db
```

Bu komut tüm tabloları oluşturur ve örnek kategorileri ekler.

## API Dokümantasyonu

Backend API dokümantasyonu için `backend/README.md` dosyasına bakın.

## Güvenlik

- JWT token tabanlı kimlik doğrulama
- Bcrypt ile şifre hashleme
- Rate limiting
- Input validation
- XSS ve CSRF koruması

## Teknolojiler

### Backend
- Node.js
- Express.js
- SQLite
- JWT
- Bcrypt
- Nodemailer

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Axios
- React Hook Form

## Lisans

Bu proje özel bir projedir.
