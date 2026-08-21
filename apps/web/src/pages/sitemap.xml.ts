import type { APIRoute } from 'astro';
import { getAllPages } from '../content/provider';

export const GET: APIRoute = () => {
  const pages = getAllPages().filter((p) => p.robots.startsWith('index'));
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map((p) => {
    const loc = p.path === '/' ? 'https://alshafra.com/' : `https://alshafra.com${p.path}`;
    return `  <url><loc>${loc}</loc><changefreq>weekly</changefreq></url>`;
  })
  .join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
