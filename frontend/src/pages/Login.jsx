// pages/Login.jsx
// ---------------
// Halaman login. Setelah berhasil, token & data user disimpan
// lewat useAuth().login lalu user diarahkan ke beranda.

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card form-card">
      <h2>Masuk</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@contoh.com"
          required
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />

        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <p className="form-links">
        <Link to="/forgot-password">Lupa password?</Link>
      </p>
      <p className="form-links">
        Belum punya akun? <Link to="/register">Daftar di sini</Link>
      </p>

      <div className="hint">
        <strong>Akun demo:</strong>
        <br />
        Admin: admin@demo.com / admin123
        <br />
        User: user@demo.com / user123
      </div>
    </div>
  );
}
