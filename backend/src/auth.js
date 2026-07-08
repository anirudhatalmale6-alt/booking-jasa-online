// auth.js
// -------
// Kumpulan fungsi bantu untuk autentikasi:
// - membuat token JWT saat user login
// - middleware untuk memeriksa token pada request yang butuh login
// - middleware untuk memastikan user adalah admin

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-jangan-dipakai-di-produksi';

// Membuat token yang berisi id, role, dan nama user.
// Token berlaku selama 7 hari.
function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Middleware: memastikan request membawa token yang valid.
// Token dikirim lewat header: "Authorization: Bearer <token>".
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Silakan login terlebih dahulu.' });
  }

  try {
    // Jika token valid, data user disimpan di req.user agar bisa dipakai route lain.
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesi tidak valid atau sudah kedaluwarsa.' });
  }
}

// Middleware: memastikan user yang sudah login adalah admin.
// Harus dipakai SETELAH requireAuth.
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'Akses khusus admin.' });
}

module.exports = { createToken, requireAuth, requireAdmin, JWT_SECRET };
