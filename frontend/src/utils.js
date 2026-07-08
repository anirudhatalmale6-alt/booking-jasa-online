// utils.js
// --------
// Fungsi bantu kecil yang dipakai di beberapa halaman.

// Ubah angka menjadi format Rupiah, misal 50000 -> "Rp50.000".
export function formatRupiah(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value || 0);
}

// Ubah tanggal "2026-12-01" menjadi "1 Des 2026" agar lebih enak dibaca.
export function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
