// pages/Services.jsx
// ------------------
// Beranda: menampilkan daftar jasa yang bisa dipesan.
// Jika user sudah login, tiap kartu punya tombol "Booking" yang
// membuka form kecil (modal) untuk memilih tanggal & jam.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth.jsx';
import { formatRupiah } from '../utils';

export default function Services() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Jasa yang sedang dipesan (null = modal tertutup).
  const [selected, setSelected] = useState(null);

  // Ambil daftar jasa saat halaman pertama kali dibuka.
  useEffect(() => {
    api
      .getServices()
      .then((data) => setServices(data.services))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleBookClick(service) {
    // Kalau belum login, arahkan ke halaman login dulu.
    if (!user) {
      navigate('/login');
      return;
    }
    setSelected(service);
  }

  if (loading) return <p>Memuat daftar jasa...</p>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Daftar Jasa</h1>
        <p className="muted">Pilih jasa yang Anda butuhkan, lalu buat booking.</p>
      </div>

      {services.length === 0 ? (
        <p>Belum ada jasa tersedia.</p>
      ) : (
        <div className="grid">
          {services.map((s) => (
            <div key={s.id} className="card service-card">
              <h3>{s.name}</h3>
              <p className="muted">{s.description}</p>
              <div className="service-meta">
                <span className="price">{formatRupiah(s.price)}</span>
                <span className="duration">⏱ {s.duration} menit</span>
              </div>
              <button className="btn btn-primary btn-block" onClick={() => handleBookClick(s)}>
                Booking
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal form booking */}
      {selected && (
        <BookingModal
          service={selected}
          token={token}
          onClose={() => setSelected(null)}
          onDone={() => {
            setSelected(null);
            navigate('/bookings');
          }}
        />
      )}
    </div>
  );
}

// Komponen kecil: form booking dalam bentuk modal.
function BookingModal({ service, token, onClose, onDone }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.createBooking(
        { service_id: service.id, date, time, notes },
        token
      );
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* stopPropagation agar klik di dalam modal tidak menutupnya */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Booking: {service.name}</h3>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Tanggal</label>
          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label>Jam</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />

          <label>Catatan (opsional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: mohon datang tepat waktu"
          />

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose}>
              Batal
            </button>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Konfirmasi Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
