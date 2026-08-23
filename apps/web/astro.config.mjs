import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://alshafra.com',
  trailingSlash: 'never',
  output: 'static',
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  server: {
    host: true,
    port: 4321,
    allowedHosts: true,
  },
  vite: {
    server: {
      host: true,
      allowedHosts: true,
    },
    preview: {
      host: true,
      allowedHosts: true,
    },
  },
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
});
