// main.jsx
// --------
// Titik masuk aplikasi React. File ini "menempelkan" komponen App
// ke elemen <div id="root"> di index.html.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './auth.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter: mengaktifkan navigasi antar halaman */}
    <BrowserRouter>
      {/* AuthProvider: menyimpan status login agar bisa dipakai di semua halaman */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
