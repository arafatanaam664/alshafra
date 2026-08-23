import type { Plugin } from 'vite';

function readBody(req: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/** Dev-only API via Vite SSR module loader (TypeScript packages). */
export function adminApiPlugin(): Plugin {
  return {
    name: 'alshafra-admin-api',
    apply: 'serve',
    configureServer(server) {
      if (process.env.ALSHAFRA_ENV !== 'production') {
        process.env.ALSHAFRA_ENV = process.env.ALSHAFRA_ENV || 'development';
        process.env.ADMIN_DEV_LOGIN = process.env.ADMIN_DEV_LOGIN || 'true';
        process.env.ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'dev-only-alshafra-admin';
      }
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/v1/')) return next();
        try {
          const cms = await server.ssrLoadModule('@alshafra/cms');
          const dbs = await server.ssrLoadModule('/server/db.ts');
          const db = await dbs.getAdminDb();
          const raw = url.split('?');
          let body: unknown;
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            const text = await readBody(req);
            body = text ? JSON.parse(text) : undefined;
          }
          const out = url.startsWith('/api/v1/admin')
            ? await cms.handleAdminApi(
                {
                  method: req.method || 'GET',
                  pathname: raw[0],
                  search: raw[1] ? `?${raw[1]}` : '',
                  headers: { cookie: String(req.headers.cookie || '') },
                  body,
                },
                db,
              )
            : await cms.handlePublicApi(
                {
                  method: req.method || 'GET',
                  pathname: raw[0],
                  search: raw[1] ? `?${raw[1]}` : '',
                  body,
                  memberId: null,
                },
                db,
              );
          res.statusCode = out.status;
          res.setHeader('x-robots-tag', 'noindex, nofollow');
          if (out.headers) {
            for (const [k, v] of Object.entries(out.headers)) res.setHeader(k, v);
          }
          if (out.raw) {
            if (!out.headers?.['content-type']) res.setHeader('content-type', 'application/octet-stream');
            res.end(Buffer.from(out.raw));
            return;
          }
          res.setHeader('content-type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(out.body));
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'server_error' }));
        }
      });
    },
  };
}
