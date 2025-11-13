// CSRF koruması için token oluşturma ve doğrulama
const crypto = require('crypto');

// CSRF token oluştur
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF token doğrula
const verifyCSRFToken = (req, res, next) => {
  // GET, HEAD, OPTIONS istekleri için CSRF kontrolü yapma
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || token !== sessionToken) {
    return res.status(403).json({
      başarılı: false,
      mesaj: 'CSRF token geçersiz'
    });
  }

  next();
};

module.exports = { generateCSRFToken, verifyCSRFToken };

