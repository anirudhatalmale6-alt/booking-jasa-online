// pages/ForgotPassword.jsx
// ------------------------
// Alur lupa password dalam dua langkah pada satu halaman:
//   1) Masukkan email  -> backend membuat token reset
//   2) Masukkan token + password baru -> password diganti
//
// Karena prototipe belum memakai layanan email, token ditampilkan
// langsung di layar agar mudah dites. Di aplikasi nyata, token
// dikirim ke email user.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Langkah 1: minta token reset.
  async function handleRequest(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const data = await api.forgotPassword({ email });
      // Token demo dari backend; otomatis diisi agar mudah dites.
      if (data.resetToken) setToken(data.resetToken);
      setMessage(
        'Token reset telah dibuat. (Pada aplikasi nyata token dikirim ke email.)'
      );
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Langkah 2: ganti password memakai token.
  async function handleReset(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.resetPassword({ token, newPassword });
      alert('Password berhasil diubah! Silakan login dengan password baru.');
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card form-card">
      <h2>Lupa Password</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {step === 1 ? (
        <form onSubmit={handleRequest}>
          <label>Email akun Anda</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Memproses...' : 'Minta Token Reset'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset}>
          <label>Token Reset</label>
          <input value={token} onChange={(e) => setToken(e.target.value)} required />

          <label>Password Baru (min. 6 karakter)</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
          />
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Memproses...' : 'Ganti Password'}
          </button>
        </form>
      )}

      <p className="form-links">
        <Link to="/login">Kembali ke halaman masuk</Link>
      </p>
    </div>
  );
}
