const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config'); // JWT secret'ı alıyoruz

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']; // Authorization header'ı al
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>" formatını ayıkla

  if (!token) {
    return res.status(401).json({ error: 'Erişim reddedildi. Token sağlanmadı.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Geçersiz token.' });
    }

    req.user = user; // Token'dan gelen kullanıcı bilgilerini req.user'a ata
    next(); // Bir sonraki middleware'e geç
  });
};

module.exports = authenticateToken;
