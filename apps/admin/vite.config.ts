import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { adminApiPlugin } from './server/vite-plugin';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), adminApiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5174,
  },
  resolve: {
    alias: {
      '@alshafra/ui': resolve(rootDir, '../../packages/ui/src/index.ts'),
      '@alshafra/auth': resolve(rootDir, '../../packages/auth/src/index.ts'),
      '@alshafra/cms': resolve(rootDir, '../../packages/cms/src/index.ts'),
      '@alshafra/database': resolve(rootDir, '../../packages/database/src/index.ts'),
      '@alshafra/kernel': resolve(rootDir, '../../packages/kernel/src/index.ts'),
      '@alshafra/content': resolve(rootDir, '../../packages/content/src/index.ts'),
      '@alshafra/seo': resolve(rootDir, '../../packages/seo/src/index.ts'),
    },
  },
});
