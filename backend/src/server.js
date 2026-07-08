// server.js
// ---------
// Titik masuk (entry point) aplikasi backend.
// File ini menyusun server Express, memasang middleware, dan
// menghubungkan semua route (auth, services, bookings).

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 4000;

// ---------- Middleware global ----------
// CORS: izinkan frontend (alamat berbeda) mengakses API ini.
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
// Baca body request dalam format JSON.
app.use(express.json());

// ---------- Health check ----------
// Endpoint sederhana untuk memastikan server hidup.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Booking Jasa berjalan.' });
});

// ---------- Route utama ----------
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);

// ---------- Penanganan route tidak ditemukan ----------
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan.' });
});

// ---------- Penanganan error tak terduga ----------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Terjadi kesalahan di server.' });
});

app.listen(PORT, () => {
  console.log(`✅ Backend berjalan di http://localhost:${PORT}`);
});
