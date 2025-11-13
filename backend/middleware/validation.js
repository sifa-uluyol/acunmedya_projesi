const { body, validationResult } = require('express-validator');

// Hata kontrolü middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      başarılı: false,
      mesaj: 'Doğrulama hatası',
      hatalar: errors.array()
    });
  }
  next();
};

// Kullanıcı kayıt doğrulama
const validateRegister = [
  body('email')
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz')
    .normalizeEmail(),
  body('şifre')
    .isLength({ min: 6 })
    .withMessage('Şifre en az 6 karakter olmalıdır'),
  body('ad')
    .trim()
    .notEmpty()
    .withMessage('Ad alanı zorunludur'),
  body('soyad')
    .trim()
    .notEmpty()
    .withMessage('Soyad alanı zorunludur'),
  handleValidationErrors
];

// Giriş doğrulama
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Geçerli bir e-posta adresi giriniz')
    .normalizeEmail(),
  body('şifre')
    .notEmpty()
    .withMessage('Şifre alanı zorunludur'),
  handleValidationErrors
];

// Ürün doğrulama
const validateProduct = [
  body('ad')
    .trim()
    .notEmpty()
    .withMessage('Ürün adı zorunludur'),
  body('fiyat')
    .isFloat({ min: 0 })
    .withMessage('Geçerli bir fiyat giriniz'),
  body('stok')
    .isInt({ min: 0 })
    .withMessage('Stok miktarı 0 veya pozitif olmalıdır'),
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  handleValidationErrors
};

