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
  if (robots.toLowerCase().includes('noindex') && !['/404', '/410'].includes(row.path)) {
    seoFail.push(`${row.path} accidental noindex (${robots})`);
  }
  if (!h1) seoFail.push(`${row.path} missing h1`);
  if (row.path !== '/' && !html.includes('aria-label="مسار التنقل"')) {
    seoFail.push(`${row.path} missing breadcrumbs`);
  }
}

const article = readFileSync(join(dist, 'articles/hijri-to-gregorian-conversion/index.html'), 'utf8');
if (!article.includes('"@type":"Article"') && !article.includes('"@type": "Article"')) {
  seoFail.push('article missing Article JSON-LD');
}
if (!article.includes('FAQPage')) seoFail.push('article missing FAQPage JSON-LD');
if (article.includes('SearchAction')) seoFail.push('SearchAction leaked');
if (article.includes('JobPosting')) seoFail.push('JobPosting leaked');

const converter = readFileSync(join(dist, 'date-converter/index.html'), 'utf8');
if (!converter.includes('WebApplication')) seoFail.push('date-converter missing WebApplication');

const indexXml = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
if (!indexXml.includes('sitemapindex')) seoFail.push('sitemap.xml must be a sitemapindex');
for (const name of ['core', 'articles', 'guides', 'tools', 'calendar']) {
  const child = join(dist, 'sitemaps', `${name}.xml`);
  if (!existsSync(child)) seoFail.push(`missing sitemap ${name}`);
}

if (missing.length || seoFail.length) {
  console.error('Astro dist regression failed');
  if (missing.length) console.error('Missing files', missing.slice(0, 20), missing.length);
  if (seoFail.length) console.error(seoFail.slice(0, 40), seoFail.length);
  process.exit(1);
}
console.log(`Astro dist ok: ${pub.published.length} routes + sitemap index + typed JSON-LD.`);
