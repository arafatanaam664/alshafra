import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://alshafra.com',
  trailingSlash: 'never',
  output: 'static',
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
});
