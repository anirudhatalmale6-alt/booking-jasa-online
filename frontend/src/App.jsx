// App.jsx
// -------
// Mengatur semua rute (halaman) aplikasi menggunakan React Router.
// Beberapa halaman dibungkus <ProtectedRoute> agar hanya bisa
// diakses setelah login (atau khusus admin).

import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Services from './pages/Services.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import MyBookings from './pages/MyBookings.jsx';
import AdminServices from './pages/AdminServices.jsx';
import AdminBookings from './pages/AdminBookings.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          {/* Halaman publik */}
          <Route path="/" element={<Services />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Halaman khusus user yang sudah login */}
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          {/* Halaman khusus admin */}
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute adminOnly>
                <AdminServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute adminOnly>
                <AdminBookings />
              </ProtectedRoute>
            }
          />

          {/* Halaman tidak ditemukan */}
          <Route path="*" element={<p>Halaman tidak ditemukan.</p>} />
        </Routes>
      </main>
    </>
  );
}
