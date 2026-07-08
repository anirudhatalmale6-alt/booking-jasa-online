// routes/services.js
// ------------------
// Endpoint untuk mengelola daftar jasa (services).
//   GET    /api/services       -> lihat semua jasa (publik)
//   GET    /api/services/:id   -> lihat satu jasa (publik)
//   POST   /api/services       -> tambah jasa (admin)
//   PUT    /api/services/:id   -> ubah jasa (admin)
//   DELETE /api/services/:id   -> hapus jasa (admin)
//
// Operasi baca boleh diakses siapa saja; operasi tulis hanya admin.

const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../auth');

const router = express.Router();

// ---------- LIHAT SEMUA JASA ----------
router.get('/', (req, res) => {
  const services = db.prepare('SELECT * FROM services ORDER BY id DESC').all();
  res.json({ services });
});

// ---------- LIHAT SATU JASA ----------
router.get('/:id', (req, res) => {
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!service) {
    return res.status(404).json({ error: 'Jasa tidak ditemukan.' });
  }
  res.json({ service });
});

// ---------- TAMBAH JASA (admin) ----------
router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { name, description, price, duration } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: 'Nama jasa wajib diisi.' });
  }

  const result = db
    .prepare(
      'INSERT INTO services (name, description, price, duration) VALUES (?, ?, ?, ?)'
    )
    .run(name, description || '', Number(price) || 0, Number(duration) || 30);

  const service = db
    .prepare('SELECT * FROM services WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json({ service });
});

// ---------- UBAH JASA (admin) ----------
router.put('/:id', requireAuth, requireAdmin, (req, res) => {
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!service) {
    return res.status(404).json({ error: 'Jasa tidak ditemukan.' });
  }

  const { name, description, price, duration } = req.body || {};

  // Pakai nilai baru bila dikirim, kalau tidak pertahankan nilai lama.
  db.prepare(
    'UPDATE services SET name = ?, description = ?, price = ?, duration = ? WHERE id = ?'
  ).run(
    name ?? service.name,
    description ?? service.description,
    price != null ? Number(price) : service.price,
    duration != null ? Number(duration) : service.duration,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  res.json({ service: updated });
});

// ---------- HAPUS JASA (admin) ----------
router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!service) {
    return res.status(404).json({ error: 'Jasa tidak ditemukan.' });
  }

  db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  res.json({ message: 'Jasa berhasil dihapus.' });
});

module.exports = router;
