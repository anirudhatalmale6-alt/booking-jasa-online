// routes/bookings.js
// ------------------
// Endpoint untuk mengelola booking/reservasi.
//   GET    /api/bookings          -> user: booking miliknya | admin: semua booking
//   POST   /api/bookings          -> user membuat booking baru
//   PATCH  /api/bookings/:id/cancel -> user membatalkan booking miliknya
//   DELETE /api/bookings/:id      -> admin menghapus booking
//
// Semua endpoint di sini butuh login.

const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../auth');

const router = express.Router();

// Ambil data booking beserta info jasa & user (JOIN antar tabel).
const SELECT_WITH_DETAILS = `
  SELECT
    b.id, b.date, b.time, b.status, b.notes, b.created_at,
    b.service_id, s.name  AS service_name, s.price AS service_price,
    b.user_id,    u.name  AS user_name,    u.email AS user_email
  FROM bookings b
  JOIN services s ON s.id = b.service_id
  JOIN users    u ON u.id = b.user_id
`;

// ---------- LIHAT BOOKING ----------
router.get('/', requireAuth, (req, res) => {
  let bookings;
  if (req.user.role === 'admin') {
    // Admin melihat semua booking.
    bookings = db.prepare(`${SELECT_WITH_DETAILS} ORDER BY b.date DESC, b.time DESC`).all();
  } else {
    // User biasa hanya melihat booking miliknya sendiri.
    bookings = db
      .prepare(`${SELECT_WITH_DETAILS} WHERE b.user_id = ? ORDER BY b.date DESC, b.time DESC`)
      .all(req.user.id);
  }
  res.json({ bookings });
});

// ---------- BUAT BOOKING ----------
router.post('/', requireAuth, (req, res) => {
  const { service_id, date, time, notes } = req.body || {};

  if (!service_id || !date || !time) {
    return res.status(400).json({ error: 'Jasa, tanggal, dan jam wajib diisi.' });
  }

  // Pastikan jasa yang dipilih benar-benar ada.
  const service = db.prepare('SELECT id FROM services WHERE id = ?').get(service_id);
  if (!service) {
    return res.status(404).json({ error: 'Jasa yang dipilih tidak ditemukan.' });
  }

  // Cegah booking untuk tanggal yang sudah lewat.
  // (Bandingkan sebagai teks YYYY-MM-DD; hari ini diambil dari server.)
  const today = new Date().toISOString().slice(0, 10);
  if (date < today) {
    return res.status(400).json({ error: 'Tanggal booking tidak boleh di masa lalu.' });
  }

  const result = db
    .prepare(
      'INSERT INTO bookings (user_id, service_id, date, time, notes) VALUES (?, ?, ?, ?, ?)'
    )
    .run(req.user.id, service_id, date, time, notes || '');

  const booking = db
    .prepare(`${SELECT_WITH_DETAILS} WHERE b.id = ?`)
    .get(result.lastInsertRowid);

  res.status(201).json({ booking });
});

// ---------- BATALKAN BOOKING (user) ----------
router.patch('/:id/cancel', requireAuth, (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking tidak ditemukan.' });
  }

  // User hanya boleh membatalkan booking miliknya sendiri (admin boleh semua).
  if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Anda tidak bisa membatalkan booking ini.' });
  }

  if (booking.status === 'cancelled') {
    return res.status(400).json({ error: 'Booking ini sudah dibatalkan.' });
  }

  db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(req.params.id);
  const updated = db.prepare(`${SELECT_WITH_DETAILS} WHERE b.id = ?`).get(req.params.id);
  res.json({ booking: updated });
});

// ---------- HAPUS BOOKING (admin) ----------
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const booking = db.prepare('SELECT id FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking tidak ditemukan.' });
  }
  db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
  res.json({ message: 'Booking berhasil dihapus.' });
});

module.exports = router;
