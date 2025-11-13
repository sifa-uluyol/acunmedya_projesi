const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Route'ları import et
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const addressRoutes = require('./routes/addresses');
const categoryRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 5000;

// Güvenlik middleware'leri
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
// CORS yapılandırması - Development'ta tüm localhost portlarına izin ver
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || 'http://localhost:3000']
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Origin yoksa (same-origin request) veya izin verilen listede ise kabul et
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Development'ta tüm origin'lere izin ver
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// URL decode middleware - Türkçe karakterli route'lar için
app.use((req, res, next) => {
  const originalUrl = req.url;
  const originalPath = req.path;
  
  if (req.url && req.url.includes('%')) {
    try {
      const decodedUrl = decodeURIComponent(req.url);
      if (decodedUrl !== req.url) {
        req.url = decodedUrl;
        req.originalUrl = decodedUrl;
        req.path = decodedUrl.split('?')[0];
      }
    } catch (e) {
      // Decode hatası
    }
  }
  if (req.path && req.path.includes('%')) {
    try {
      const decodedPath = decodeURIComponent(req.path);
      if (decodedPath !== req.path) {
        req.path = decodedPath;
      }
    } catch (e) {
      // Decode hatası
    }
  }
  next();
});

// XSS koruması için input sanitization
app.use((req, res, next) => {
  if (req.body) {
    // Basit XSS koruması - gerçek uygulamada daha gelişmiş sanitization kullanın
    const sanitize = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
});

// Rate limiting - Development'ta daha gevşek
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Development'ta 1000 istek
  message: {
    başarılı: false,
    mesaj: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// API Route'ları
app.use('/api/auth', authRoutes);
// Türkçe karakterli route'lar - hem encode edilmiş hem decode edilmiş versiyonları destekle
app.use('/api/ürünler', productRoutes);
app.use('/api/%C3%BCr%C3%BCnler', productRoutes); // Encode edilmiş versiyon
app.use('/api/sepet', cartRoutes);

app.use('/api/siparişler', orderRoutes);
app.use('/api/sipari%C5%9Fler', orderRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/adresler', addressRoutes);
app.use('/api/kategoriler', categoryRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    başarılı: true,
    mesaj: 'Backend API çalışıyor!',
    zaman: new Date().toISOString()
  });
});

// Root endpoint (opsiyonel)
app.get('/', (req, res) => {
  res.json({
    başarılı: true,
    mesaj: 'Acunmedya Backend API',
    versiyon: '1.0.0',
    api: '/api',
    test: '/api/test'
  });
});

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const ignorePaths = ['/.well-known', '/favicon.ico', '/robots.txt', '/sitemap.xml'];
    if (!ignorePaths.some(path => req.path.startsWith(path)) && req.path.startsWith('/api/')) {
      console.log(`📡 ${req.method} ${req.path}`);
    }
    next();
  });
}

// 404 handler - Detaylı hata mesajı (sadece API route'ları için)
app.use((req, res) => {
  // Zararsız istekleri sessizce yok say
  const ignorePaths = [
    '/.well-known',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml'
  ];
  
  if (ignorePaths.some(path => req.path.startsWith(path))) {
    return res.status(404).end();
  }
  
  if (req.path.startsWith('/api/')) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`🔴 [404] ${req.method} ${req.path}`);
    }
    return res.status(404).json({
      başarılı: false,
      mesaj: 'Endpoint bulunamadı'
    });
  }
  
  // Diğer istekler için basit 404
  res.status(404).json({
    başarılı: false,
    mesaj: 'Sayfa bulunamadı'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Sunucu Hatası:', err);
  res.status(err.status || 500).json({
    başarılı: false,
    mesaj: err.message || 'Sunucu hatası',
    detay: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda çalışıyor`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
  console.log(`\n📋 Mevcut Endpoint'ler:`);
  console.log(`   - POST /api/auth/kayit`);
  console.log(`   - POST /api/auth/giris`);
  console.log(`   - GET  /api/auth/profil`);
  console.log(`   - GET  /api/ürünler`);
  console.log(`   - GET  /api/sepet`);
  console.log(`   - GET  /api/siparişler`);
  console.log(`   - GET  /api/admin/dashboard`);
  console.log(`   - GET  /api/admin/kullanıcılar`);
  console.log(`   - GET  /api/admin/kategoriler`);
  console.log(`   - GET  /api/admin/kuponlar`);
  console.log(`   - GET  /api/siparişler/admin/tümü`);
  console.log(`\n✅ Backend hazır! Frontend'den API çağrıları yapabilirsiniz.`);
});
