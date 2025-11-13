const nodemailer = require('nodemailer');
require('dotenv').config();

// E-posta gönderici oluştur
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// E-posta doğrulama maili gönder
const gönderEmailDoğrulama = async (email, doğrulamaKodu) => {
  try {
    const mailOptions = {
      from: `"Acunmedya" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'E-posta Adresinizi Doğrulayın',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">E-posta Doğrulama</h2>
          <p>Merhaba,</p>
          <p>Hesabınızı aktifleştirmek için aşağıdaki kodu kullanın:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; margin: 0;">${doğrulamaKodu}</h1>
          </div>
          <p>Bu kod 24 saat geçerlidir.</p>
          <p>İyi alışverişler!</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    return false;
  }
};

// Şifre sıfırlama maili gönder
const gönderŞifreSıfırlama = async (email, sıfırlamaKodu) => {
  try {
    const mailOptions = {
      from: `"Acunmedya" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Şifre Sıfırlama',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Şifre Sıfırlama</h2>
          <p>Merhaba,</p>
          <p>Şifrenizi sıfırlamak için aşağıdaki kodu kullanın:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #dc3545; margin: 0;">${sıfırlamaKodu}</h1>
          </div>
          <p>Bu kod 1 saat geçerlidir.</p>
          <p>Eğer bu işlemi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    return false;
  }
};

// Sipariş onay maili gönder
const gönderSiparişOnay = async (email, siparişNumarası, siparişDetayları) => {
  try {
    const mailOptions = {
      from: `"Acunmedya" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Sipariş Onayı - ${siparişNumarası}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Siparişiniz Alındı!</h2>
          <p>Sipariş Numaranız: <strong>${siparişNumarası}</strong></p>
          <p>Siparişiniz en kısa sürede hazırlanacaktır.</p>
          <p>Teşekkür ederiz!</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('E-posta gönderme hatası:', error);
    return false;
  }
};

module.exports = {
  gönderEmailDoğrulama,
  gönderŞifreSıfırlama,
  gönderSiparişOnay
};

