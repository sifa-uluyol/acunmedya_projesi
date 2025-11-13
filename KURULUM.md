# Acunmedya Projesi - Kurulum ve Çalıştırma

## Adım 1: SQLite Veritabanını Oluşturun

Backend klasöründe:
```bash
cd backend
npm run init-db
```

Bu komut `database/acunmedya.db` dosyasını oluşturur ve tüm tabloları kurar.

(İsteğe bağlı) Örnek veriler için `database/seed.sql` dosyasını SQLite'da çalıştırabilirsiniz.

## Adım 2: Backend Kurulumu

```bash
cd backend
npm install
```

Backend'i başlatın:
```bash
npm run dev
```

Backend `http://localhost:5000` adresinde çalışacak.

**Not:** `.env` dosyası opsiyoneldir. SQLite kullanıyoruz, ekstra yapılandırma gerekmiyor.

## Adım 3: Frontend Kurulumu

Yeni bir terminal penceresi açın:

```bash
cd frontend
npm install
```

Frontend'i başlatın:
```bash
npm run dev
```

Frontend `http://localhost:3000` adresinde çalışacak.

## Hızlı Başlatma (Tüm Komutlar)

### Terminal 1 - Backend:
```bash
cd backend
npm install
npm run init-db
npm run dev
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Kontrol

1. Backend: http://localhost:5000/api/test
2. Frontend: http://localhost:3000

## Sorun Giderme

### Veritabanı bağlantı hatası:
- `npm run init-db` komutunu çalıştırın
- `backend/database/acunmedya.db` dosyasının var olduğundan emin olun
- Klasör izinlerini kontrol edin

### Port zaten kullanılıyor:
- Backend portu değiştirmek için: `backend/.env` dosyasında `PORT=5001` yapın
- Frontend portu değiştirmek için: `frontend/package.json` dosyasında `"dev": "next dev -p 3001"` yapın

### Module bulunamadı hatası:
- `npm install` komutunu tekrar çalıştırın
- `node_modules` klasörünü silip tekrar `npm install` yapın

### Veritabanı tablo bulunamadı:
- `npm run init-db` komutunu çalıştırın
