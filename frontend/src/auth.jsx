// auth.jsx
// --------
// "Context" untuk menyimpan status login di seluruh aplikasi.
// Dengan ini, halaman mana pun bisa tahu:
//   - siapa user yang login (user)
//   - token untuk memanggil API (token)
//   - fungsi login() dan logout()
//
// Token & data user disimpan di localStorage agar tetap login
// walau halaman di-refresh.

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Ambil data awal dari localStorage (jika sebelumnya sudah login).
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  // Dipanggil setelah login/register berhasil.
  function login(token, user) {
    setToken(token);
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Menghapus sesi login.
  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook praktis agar komponen bisa memakai: const { user, token } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
