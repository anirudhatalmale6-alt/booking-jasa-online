// components/Navbar.jsx
// ---------------------
// Menu navigasi di bagian atas. Isinya menyesuaikan status login:
//   - belum login   -> tampil tombol Masuk & Daftar
//   - user biasa     -> tampil menu Jasa & Booking Saya
//   - admin          -> tampil menu tambahan Kelola Jasa & Semua Booking

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        📅 BookingJasa
      </Link>

      <div className="nav-links">
        <Link to="/">Jasa</Link>

        {user && <Link to="/bookings">Booking Saya</Link>}

        {user?.role === 'admin' && (
          <>
            <Link to="/admin/services">Kelola Jasa</Link>
            <Link to="/admin/bookings">Semua Booking</Link>
          </>
        )}

        {user ? (
          <>
            <span className="nav-user">Hai, {user.name}</span>
            <button className="btn btn-sm" onClick={handleLogout}>
              Keluar
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Masuk</Link>
            <Link to="/register" className="btn btn-sm">
              Daftar
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
