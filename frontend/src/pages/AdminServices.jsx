// pages/AdminServices.jsx
// -----------------------
// Halaman admin untuk mengelola jasa: tambah, edit, dan hapus.
// Form di kiri dipakai untuk menambah jasa baru atau mengubah
// jasa yang sedang dipilih.

import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth.jsx';
import { formatRupiah } from '../utils';

const EMPTY = { name: '', description: '', price: '', duration: '' };

export default function AdminServices() {
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null); // null = mode tambah
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    api
      .getServices()
      .then((data) => setServices(data.services))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Isi form dengan data jasa yang mau diedit.
  function startEdit(service) {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration: service.duration,
    });
  }

  // Kembali ke mode tambah (kosongkan form).
  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.updateService(editingId, form, token);
      } else {
        await api.createService(form, token);
      }
      cancelEdit();
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus jasa ini? Booking terkait juga akan terhapus.')) return;
    try {
      await api.deleteService(id, token);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Kelola Jasa</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="admin-layout">
        {/* Form tambah/edit */}
        <div className="card form-card">
          <h3>{editingId ? 'Edit Jasa' : 'Tambah Jasa Baru'}</h3>
          <form onSubmit={handleSubmit}>
            <label>Nama Jasa</label>
            <input name="name" value={form.name} onChange={handleChange} required />

            <label>Deskripsi</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
            />

            <label>Harga (Rp)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              min="0"
              required
            />

            <label>Durasi (menit)</label>
            <input
              type="number"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              min="1"
              required
            />

            <div className="modal-actions">
              {editingId && (
                <button type="button" className="btn" onClick={cancelEdit}>
                  Batal
                </button>
              )}
              <button className="btn btn-primary">
                {editingId ? 'Simpan Perubahan' : 'Tambah'}
              </button>
            </div>
          </form>
        </div>

        {/* Daftar jasa */}
        <div className="table-wrap">
          {loading ? (
            <p>Memuat...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Harga</th>
                  <th>Durasi</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{formatRupiah(s.price)}</td>
                    <td>{s.duration} mnt</td>
                    <td className="row-actions">
                      <button className="btn btn-sm" onClick={() => startEdit(s)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(s.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
