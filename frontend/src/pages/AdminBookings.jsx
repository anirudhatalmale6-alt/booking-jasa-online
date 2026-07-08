// pages/AdminBookings.jsx
// -----------------------
// Halaman admin untuk melihat SEMUA booking dari semua user.
// Admin bisa membatalkan atau menghapus booking.

import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth.jsx';
import { formatRupiah, formatDate } from '../utils';

export default function AdminBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    if (!confirm('Batalkan booking ini?')) return;
    try {
      await api.cancelBooking(id, token);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus permanen booking ini?')) return;
    try {
      await api.deleteBooking(id, token);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <p>Memuat booking...</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Semua Booking</h1>
        <p className="muted">Total: {bookings.length} booking</p>
      </div>

      {bookings.length === 0 ? (
        <p>Belum ada booking.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Pelanggan</th>
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
                  <td>
                    {b.user_name}
                    <br />
                    <small className="muted">{b.user_email}</small>
                  </td>
                  <td>{b.service_name}</td>
                  <td>{formatDate(b.date)}</td>
                  <td>{b.time}</td>
                  <td>{formatRupiah(b.service_price)}</td>
                  <td>
                    <span className={`badge badge-${b.status}`}>
                      {b.status === 'confirmed' ? 'Aktif' : 'Dibatalkan'}
                    </span>
                  </td>
                  <td className="row-actions">
                    {b.status === 'confirmed' && (
                      <button className="btn btn-sm" onClick={() => handleCancel(b.id)}>
                        Batalkan
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(b.id)}
                    >
                      Hapus
                    </button>
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
