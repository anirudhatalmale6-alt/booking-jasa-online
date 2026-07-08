# Aplikasi Booking Jasa Online

Aplikasi web sederhana untuk memesan (booking) jasa secara online.
Dibuat sebagai proyek belajar full-stack: pengguna bisa mendaftar, login,
melihat daftar jasa, dan membuat booking. Admin bisa mengelola jasa dan
melihat semua booking.

Dibuat dengan **React** (frontend) + **Node.js/Express** (backend) + **SQLite** (database).

---

## ✨ Fitur

- **Autentikasi**: daftar, login, dan lupa password
- **User biasa**:
  - Melihat daftar jasa
  - Membuat booking (pilih tanggal & jam)
  - Melihat & membatalkan booking sendiri
- **Admin**:
  - Menambah, mengubah, menghapus jasa
  - Melihat semua booking, membatalkan, atau menghapusnya
- Tampilan responsif (nyaman di HP maupun laptop)

---

## 🗂 Struktur Proyek

```
40569519/
├── backend/            # API server (Node.js + Express)
│   ├── src/
│   │   ├── server.js       # titik masuk server
│   │   ├── db.js           # koneksi & tabel database
│   │   ├── auth.js         # fungsi & middleware login (JWT)
│   │   ├── seed.js         # mengisi data contoh
│   │   └── routes/
│   │       ├── auth.js         # register, login, lupa password
│   │       ├── services.js     # CRUD jasa
│   │       └── bookings.js     # CRUD booking
│   ├── .env.example
│   └── package.json
│
└── frontend/           # Aplikasi React (Vite)
    ├── src/
    │   ├── main.jsx        # titik masuk React
    │   ├── App.jsx         # daftar halaman (routing)
    │   ├── api.js          # semua panggilan ke backend
    │   ├── auth.jsx        # penyimpan status login
    │   ├── utils.js        # fungsi bantu (format Rupiah, tanggal)
    │   ├── styles.css      # tampilan aplikasi
    │   ├── components/     # Navbar, ProtectedRoute
    │   └── pages/          # halaman-halaman aplikasi
    ├── .env.example
    └── package.json
```

---

## 🚀 Cara Menjalankan di Komputer Lokal

Butuh **Node.js versi 18 atau lebih baru**. Cek dengan: `node --version`

Aplikasi terdiri dari dua bagian (backend & frontend) yang dijalankan
di **dua terminal terpisah**.

### 1. Backend (server API)

```bash
cd backend
npm install                 # install library (sekali saja)
cp .env.example .env        # buat file konfigurasi
npm run seed                # isi data contoh (jasa + akun demo)
npm start                   # jalankan server di http://localhost:4000
```

### 2. Frontend (tampilan web)

Buka terminal **baru**:

```bash
cd frontend
npm install                 # install library (sekali saja)
cp .env.example .env        # buat file konfigurasi
npm run dev                 # jalankan di http://localhost:5173
```

Lalu buka **http://localhost:5173** di browser.

### 🔑 Akun Demo

Setelah menjalankan `npm run seed`, tersedia dua akun:

| Peran | Email           | Password  |
| ----- | --------------- | --------- |
| Admin | admin@demo.com  | admin123  |
| User  | user@demo.com   | user123   |

---

## 🔌 Daftar API (Backend)

Semua endpoint diawali `http://localhost:4000/api`.

### Auth
| Method | Endpoint               | Keterangan                    | Butuh login |
| ------ | ---------------------- | ----------------------------- | ----------- |
| POST   | /auth/register         | Daftar akun baru              | –           |
| POST   | /auth/login            | Login, dapat token            | –           |
| POST   | /auth/forgot-password  | Minta token reset password    | –           |
| POST   | /auth/reset-password   | Ganti password pakai token    | –           |
| GET    | /auth/me               | Info user yang login          | ✅          |

### Services (Jasa)
| Method | Endpoint        | Keterangan          | Akses       |
| ------ | --------------- | ------------------- | ----------- |
| GET    | /services       | Lihat semua jasa    | publik      |
| GET    | /services/:id   | Lihat satu jasa     | publik      |
| POST   | /services       | Tambah jasa         | admin       |
| PUT    | /services/:id   | Ubah jasa           | admin       |
| DELETE | /services/:id   | Hapus jasa          | admin       |

### Bookings
| Method | Endpoint               | Keterangan                          | Akses         |
| ------ | ---------------------- | ----------------------------------- | ------------- |
| GET    | /bookings              | Lihat booking (sendiri / semua)     | login         |
| POST   | /bookings              | Buat booking baru                   | login         |
| PATCH  | /bookings/:id/cancel   | Batalkan booking                    | pemilik/admin |
| DELETE | /bookings/:id          | Hapus booking                       | admin         |

> Untuk endpoint yang butuh login, sertakan header:
> `Authorization: Bearer <token>` (token didapat saat login).

---

## 🌐 Cara Deploy (Membuat Versi Online)

Ada banyak pilihan hosting. Berikut cara yang paling mudah & gratis:

### Backend → Render.com (atau Railway)
1. Push kode ke GitHub.
2. Di Render, buat **New Web Service**, hubungkan ke repo ini.
3. Setelan:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Tambahkan Environment Variables (dari `.env.example`):
   - `JWT_SECRET` = (isi string acak yang panjang)
   - `CLIENT_URL` = (alamat frontend nanti, mis. `https://namaanda.vercel.app`)
5. Setelah deploy, jalankan seed sekali lewat menu **Shell**: `npm run seed`.

> Catatan: SQLite menyimpan data di file. Di hosting gratis, file bisa
> ter-reset saat aplikasi restart. Untuk produksi serius, ganti ke
> PostgreSQL/MySQL. Untuk prototipe & demo, SQLite sudah cukup.

### Frontend → Vercel (atau Netlify)
1. Di Vercel, **Import Project** dari GitHub.
2. Setelan:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Tambahkan Environment Variable:
   - `VITE_API_URL` = alamat backend + `/api`
     (mis. `https://booking-jasa-api.onrender.com/api`)
4. Deploy. Selesai!

---

## 🛠 Teknologi yang Dipakai

- **Frontend**: React 18, React Router, Vite
- **Backend**: Node.js, Express, JSON Web Token (JWT), bcrypt
- **Database**: SQLite (via better-sqlite3)

---

## 💡 Ide Pengembangan Lanjutan

- Kirim token lupa password lewat email sungguhan
- Cegah jam booking yang bentrok (double booking)
- Halaman profil & ubah data akun
- Pembayaran online
- Notifikasi email saat booking dibuat

Selamat belajar & semoga bermanfaat! 🙌
