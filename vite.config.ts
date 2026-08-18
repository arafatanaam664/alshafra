import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['.e2b.app'],
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
