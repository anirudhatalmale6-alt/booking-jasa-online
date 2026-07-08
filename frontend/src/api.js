// api.js
// ------
// Satu tempat untuk semua komunikasi ke backend API.
// Fungsi request() otomatis:
//   - menambahkan alamat dasar API
//   - menyisipkan token login (jika ada) ke header
//   - mengubah body menjadi JSON
//   - melempar error dengan pesan dari server bila gagal

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Coba baca JSON; beberapa response mungkin kosong.
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Lempar pesan error dari server agar bisa ditampilkan ke user.
    throw new Error(data.error || 'Terjadi kesalahan.');
  }
  return data;
}

// Kumpulan fungsi API yang dikelompokkan agar rapi.
export const api = {
  // --- Auth ---
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body }),
  resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body }),
  me: (token) => request('/auth/me', { token }),

  // --- Services ---
  getServices: () => request('/services'),
  createService: (body, token) => request('/services', { method: 'POST', body, token }),
  updateService: (id, body, token) =>
    request(`/services/${id}`, { method: 'PUT', body, token }),
  deleteService: (id, token) =>
    request(`/services/${id}`, { method: 'DELETE', token }),

  // --- Bookings ---
  getBookings: (token) => request('/bookings', { token }),
  createBooking: (body, token) => request('/bookings', { method: 'POST', body, token }),
  cancelBooking: (id, token) =>
    request(`/bookings/${id}/cancel`, { method: 'PATCH', token }),
  deleteBooking: (id, token) =>
    request(`/bookings/${id}`, { method: 'DELETE', token }),
};
