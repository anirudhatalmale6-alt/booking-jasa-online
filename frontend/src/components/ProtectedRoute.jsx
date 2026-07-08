// components/ProtectedRoute.jsx
// -----------------------------
// Pembungkus halaman yang hanya boleh diakses setelah login.
// Jika belum login -> dialihkan ke halaman /login.
// Jika butuh admin tapi user biasa -> dialihkan ke beranda.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}
