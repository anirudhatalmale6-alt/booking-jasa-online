// routes/auth.js
// --------------
// Semua endpoint yang berhubungan dengan akun:
//   POST /api/auth/register        -> daftar akun baru
//   POST /api/auth/login           -> login, mendapatkan token
//   POST /api/auth/forgot-password -> minta token reset password
//   POST /api/auth/reset-password  -> ganti password pakai token
//   GET  /api/auth/me              -> data user yang sedang login

const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const { createToken, requireAuth } = require('../auth');

const router = express.Router();

// Validasi email sederhana.
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------- REGISTER ----------
router.post('/register', (req, res) => {
  const { name, email, password } = req.body || {};

  // Cek input wajib.
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nama, email, dan password wajib diisi.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Format email tidak valid.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter.' });
  }

  // Cek apakah email sudah terdaftar.
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email sudah terdaftar.' });
  }

  // Hash password sebelum disimpan (jangan pernah simpan password asli).
  const hashed = bcrypt.hashSync(password, 10);

  const result = db
    .prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)')
    .run(name, email, hashed);

  const user = db
    .prepare('SELECT id, name, email, role FROM users WHERE id = ?')
    .get(result.lastInsertRowid);

  // Langsung berikan token agar user otomatis login setelah daftar.
  const token = createToken(user);
  res.status(201).json({ token, user });
});

// ---------- LOGIN ----------
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  // Pesan error dibuat sama untuk email/password salah demi keamanan
  // (agar orang tidak bisa menebak email mana yang terdaftar).
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Email atau password salah.' });
  }

  const token = createToken(user);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// ---------- LUPA PASSWORD ----------
// Karena prototipe ini belum terhubung layanan email, token reset
// dikembalikan langsung di response agar bisa dites. Di aplikasi nyata,
// token ini dikirim ke email user, bukan ditampilkan seperti ini.
router.post('/forgot-password', (req, res) => {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: 'Email wajib diisi.' });
  }

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

  // Selalu balas sukses walau email tidak ada (mencegah penebakan email).
  if (!user) {
    return res.json({ message: 'Jika email terdaftar, token reset telah dibuat.' });
  }

  // Buat token acak yang berlaku 1 jam.
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 60 * 60 * 1000;

  db.prepare('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?')
    .run(token, expires, user.id);

  res.json({
    message: 'Token reset berhasil dibuat.',
    // CATATAN: di produksi, jangan kirim token di sini — kirim via email.
    resetToken: token,
  });
});

// ---------- RESET PASSWORD ----------
router.post('/reset-password', (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token dan password baru wajib diisi.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE reset_token = ?').get(token);

  // Token harus ada dan belum kedaluwarsa.
  if (!user || !user.reset_expires || user.reset_expires < Date.now()) {
    return res.status(400).json({ error: 'Token tidak valid atau sudah kedaluwarsa.' });
  }

  const hashed = bcrypt.hashSync(newPassword, 10);
  db.prepare(
    'UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?'
  ).run(hashed, user.id);

  res.json({ message: 'Password berhasil diubah. Silakan login kembali.' });
});

// ---------- DATA USER SAAT INI ----------
router.get('/me', requireAuth, (req, res) => {
  const user = db
    .prepare('SELECT id, name, email, role FROM users WHERE id = ?')
    .get(req.user.id);
  res.json({ user });
});

module.exports = router;
