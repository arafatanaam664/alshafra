import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, sep } from 'node:path';

// Vite's default preview SPA fallback returns 200 for every unknown path. This
// development-only middleware mirrors the existing Netlify static-route
// behaviour for verification; it does not modify production redirects.
function staticPreviewStatus(): Plugin {
  return {
    name: 'static-preview-status',
    configurePreviewServer(server) {
      const root = resolve(server.config.root, server.config.build.outDir);
      server.middlewares.use((req, res, next) => {
        if (!['GET', 'HEAD'].includes(req.method || '')) return next();
        let pathname: string;
        try { pathname = decodeURIComponent(new URL(req.url || '/', 'http://preview').pathname); }
        catch { res.statusCode = 400; return res.end('Bad request'); }
        if (pathname === '/index.html') {
          res.statusCode = 301;
          res.setHeader('Location', '/');
          return res.end();
        }
        const legacy = /^\/(category|languages|news)\//.test(pathname);
        const candidate = resolve(root, `.${pathname}`);
        const insideRoot = candidate === root || candidate.startsWith(root + sep);
        const isFile = (path: string) => existsSync(path) && statSync(path).isFile();
        // Serve each generated HTML document, not Vite's root SPA fallback.
        const generatedIndex = insideRoot ? resolve(candidate, 'index.html') : '';
        if (!legacy && generatedIndex && isFile(generatedIndex)) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.end(req.method === 'HEAD' ? undefined : readFileSync(generatedIndex));
        }
        if (!legacy && insideRoot && isFile(candidate)) return next();
        const status = legacy ? 410 : 404;
        const errorPage = resolve(root, `${status}.html`);
        res.statusCode = status;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Robots-Tag', 'noindex');
        return res.end(req.method === 'HEAD' ? undefined : isFile(errorPage) ? readFileSync(errorPage) : 'Not found');
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), staticPreviewStatus()],
  optimizeDeps: { exclude: ['lucide-react'] },
});
