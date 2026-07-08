// pages/MyBookings.jsx
// --------------------
// Menampilkan daftar booking milik user yang sedang login.
// User bisa membatalkan booking yang masih aktif.

import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth.jsx';
import { formatRupiah, formatDate } from '../utils';

export default function MyBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Ambil data booking dari server.
  function load() {
    setLoading(true);
    api
      .getBookings(token)
      .then((data) => setBookings(data.bookings))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCancel(id) {
    if (!confirm('Yakin ingin membatalkan booking ini?')) return;
    try {
      await api.cancelBooking(id, token);
      load(); // muat ulang agar status terbaru tampil
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p>Memuat booking...</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Booking Saya</h1>
      </div>

      {bookings.length === 0 ? (
        <p>Anda belum punya booking. Silakan pilih jasa di halaman utama.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Jasa</th>
                <th>Tanggal</th>
                <th>Jam</th>
                <th>Harga</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.service_name}</td>
                  <td>{formatDate(b.date)}</td>
                  <td>{b.time}</td>
                  <td>{formatRupiah(b.service_price)}</td>
                  <td>
                    <span className={`badge badge-${b.status}`}>
                      {b.status === 'confirmed' ? 'Aktif' : 'Dibatalkan'}
                    </span>
                  </td>
                  <td>
                    {b.status === 'confirmed' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleCancel(b.id)}
                      >
                        Batalkan
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
