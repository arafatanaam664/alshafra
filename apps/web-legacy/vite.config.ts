import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const rootDir = dirname(fileURLToPath(import.meta.url));
const pkg = (name: string) => resolve(rootDir, `../../packages/${name}/src/index.ts`);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@alshafra/calendar': pkg('calendar'),
      '@alshafra/config': pkg('config'),
      '@alshafra/seo': pkg('seo'),
      '@alshafra/tools': pkg('tools'),
      '@alshafra/ui': pkg('ui'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
