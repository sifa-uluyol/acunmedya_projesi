const jwt = require('jsonwebtoken');

// JWT token oluştur
const generateToken = (userId, role = 'user') => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'acunmedya_super_gizli_anahtar_2024',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// JWT token doğrula
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'acunmedya_super_gizli_anahtar_2024');
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };

