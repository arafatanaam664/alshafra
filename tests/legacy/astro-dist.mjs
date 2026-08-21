#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const pub = JSON.parse(readFileSync(join(root, 'apps/web-legacy/public/published.json'), 'utf8'));
const dist = join(root, 'apps/web/dist');
if (!existsSync(dist)) {
  console.error('Astro dist missing. Run npm run build first.');
  process.exit(1);
}

const missing = [];
const seoFail = [];
for (const row of pub.published) {
  const file = row.path === '/' ? join(dist, 'index.html') : join(dist, row.path.replace(/^\//, ''), 'index.html');
  if (!existsSync(file)) {
    missing.push(row.path);
    continue;
  }
  const html = readFileSync(file, 'utf8');
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] || '';
  const canonical = html.match(/rel="canonical" href="([^"]+)"/i)?.[1] || '';
  const robots = html.match(/name="robots" content="([^"]+)"/i)?.[1] || '';
  const h1 = /<h1[\s\S]*?>[\s\S]*?<\/h1>/i.test(html);
  if (!title) seoFail.push(`${row.path} missing title`);
  if (!canonical.includes('alshafra.com')) seoFail.push(`${row.path} bad canonical ${canonical}`);
  if (/noindex/i.test(robots) && row.path !== '/') {
    /* homepage indexable; others from provider are index */
  }
  if (robots.toLowerCase().includes('noindex') && !['/404', '/410'].includes(row.path)) {
    seoFail.push(`${row.path} accidental noindex (${robots})`);
  }
  if (!h1) seoFail.push(`${row.path} missing h1`);
}

if (missing.length || seoFail.length) {
  console.error('Astro dist regression failed');
  if (missing.length) console.error('Missing files', missing.slice(0, 20), missing.length);
  if (seoFail.length) console.error(seoFail.slice(0, 30), seoFail.length);
  process.exit(1);
}
console.log(`Astro dist ok: ${pub.published.length} routes with title/canonical/h1.`);
