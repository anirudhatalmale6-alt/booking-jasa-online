import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Konfigurasi Vite (build tool untuk React).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
