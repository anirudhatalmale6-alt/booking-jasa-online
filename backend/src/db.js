// db.js
// -----
// File ini mengatur koneksi ke database SQLite dan membuat tabel-tabel
// yang dibutuhkan aplikasi (users, services, bookings).
//
// Kita pakai library "better-sqlite3" karena sederhana dan cepat:
// tidak perlu install server database terpisah — datanya disimpan
// dalam satu file bernama "data.sqlite".

const Database = require('better-sqlite3');
const path = require('path');

// Lokasi file database (berada di dalam folder backend).
const dbPath = path.join(__dirname, '..', 'data.sqlite');

// Buka (atau buat) file database.
const db = new Database(dbPath);

// Aktifkan foreign key agar relasi antar tabel dijaga oleh database.
db.pragma('foreign_keys = ON');

// -------------------------------------------------------------
// Membuat tabel jika belum ada.
// "IF NOT EXISTS" berarti tabel hanya dibuat sekali; menjalankan
// ini berulang kali aman dan tidak menghapus data.
// -------------------------------------------------------------
db.exec(`
  -- Tabel USERS: menyimpan akun pengguna dan admin
  CREATE TABLE IF NOT EXISTS users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT    NOT NULL,
    email        TEXT    NOT NULL UNIQUE,
    password     TEXT    NOT NULL,           -- disimpan dalam bentuk hash, bukan teks asli
    role         TEXT    NOT NULL DEFAULT 'user',  -- 'user' atau 'admin'
    reset_token  TEXT,                        -- token untuk fitur lupa password
    reset_expires INTEGER,                    -- waktu kedaluwarsa token (epoch ms)
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Tabel SERVICES: daftar jasa yang bisa dipesan
  CREATE TABLE IF NOT EXISTS services (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT,
    price       INTEGER NOT NULL DEFAULT 0,   -- harga dalam Rupiah
    duration    INTEGER NOT NULL DEFAULT 30,  -- durasi dalam menit
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  -- Tabel BOOKINGS: pesanan/reservasi yang dibuat pengguna
  CREATE TABLE IF NOT EXISTS bookings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL,
    service_id  INTEGER NOT NULL,
    date        TEXT    NOT NULL,             -- format: YYYY-MM-DD
    time        TEXT    NOT NULL,             -- format: HH:MM
    status      TEXT    NOT NULL DEFAULT 'confirmed', -- confirmed / cancelled
    notes       TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now')),

    -- Relasi: jika user/service dihapus, booking terkait ikut terhapus
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
  );
`);

module.exports = db;
