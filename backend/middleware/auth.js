const { verifyToken } = require('../config/jwt');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        başarılı: false,
        mesaj: 'Oturum açmanız gerekiyor'
      });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        başarılı: false,
        mesaj: 'Geçersiz veya süresi dolmuş token'
      });
    }

    req.kullanıcı = decoded;
    next();
  } catch (error) {
    console.error('❌ [AUTH] Hata:', error.message);
    return res.status(401).json({
      başarılı: false,
      mesaj: 'Kimlik doğrulama hatası'
    });
  }
};

const adminOnly = (req, res, next) => {
  if (req.kullanıcı?.role !== 'admin') {
    return res.status(403).json({
      başarılı: false,
      mesaj: 'Bu işlem için admin yetkisi gerekiyor'
    });
  }
  next();
};

module.exports = { authenticate, adminOnly };

