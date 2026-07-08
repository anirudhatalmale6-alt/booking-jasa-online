// seed.js
// -------
// Skrip untuk mengisi data awal (contoh) ke database:
//   - 1 akun admin
//   - 1 akun user biasa
//   - beberapa contoh jasa
//
// Jalankan dengan: npm run seed
// Aman dijalankan ulang: data lama akan dibersihkan dulu.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

console.log('🌱 Mengisi data contoh...');

// Bersihkan data lama agar hasil seed konsisten.
db.exec('DELETE FROM bookings; DELETE FROM services; DELETE FROM users;');

// --- Akun admin ---
const adminPass = bcrypt.hashSync('admin123', 10);
db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
  .run('Admin', 'admin@demo.com', adminPass, 'admin');

// --- Akun user biasa ---
const userPass = bcrypt.hashSync('user123', 10);
db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)')
  .run('Budi Santoso', 'user@demo.com', userPass, 'user');

// --- Contoh jasa ---
const services = [
  ['Potong Rambut Pria', 'Cukur rapi + keramas untuk pria', 50000, 45],
  ['Servis AC Rumah', 'Cuci & isi freon AC split hingga 1 PK', 150000, 90],
  ['Konsultasi Pajak', 'Sesi konsultasi pajak pribadi/UMKM', 200000, 60],
  ['Pijat Refleksi', 'Pijat refleksi kaki & punggung 60 menit', 100000, 60],
  ['Les Privat Matematika', 'Bimbingan matematika SD–SMP per sesi', 75000, 90],
];

const insertService = db.prepare(
  'INSERT INTO services (name, description, price, duration) VALUES (?, ?, ?, ?)'
);
for (const s of services) {
  insertService.run(...s);
}

console.log('✅ Selesai!');
console.log('   Admin -> email: admin@demo.com | password: admin123');
console.log('   User  -> email: user@demo.com  | password: user123');
console.log(`   ${services.length} contoh jasa ditambahkan.`);
