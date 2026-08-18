import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const dist = path.join(process.cwd(), 'dist');
const errors = [];

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
}

function routeForFile(file) {
  const relative = path.relative(dist, file).replaceAll(path.sep, '/');
  return relative === 'index.html' ? '/' : `/${relative.replace(/\/index\.html$/, '')}`;
}

function normalizedPath(value) {
  const clean = value.split(/[?#]/, 1)[0];
  return clean.length > 1 ? clean.replace(/\/+$/, '') : clean;
}

const manifest = JSON.parse(await readFile(path.join(dist, 'published.json'), 'utf8'));
const published = new Set(manifest.published.map((item) => item.path));
const htmlFiles = (await walk(dist)).filter((file) => file.endsWith('/index.html') || file === path.join(dist, 'index.html'));
const alternates = new Map();

for (const file of htmlFiles) {
  const route = routeForFile(file);
  const html = await readFile(file, 'utf8');
  const h1Count = (html.match(/<h1\b/gi) || []).length;
  const canonicalCount = (html.match(/<link\s+rel=["']canonical["']/gi) || []).length;
  const robots = html.match(/<meta name="robots" content="([^"]+)">/i)?.[1] || '';
  const googlebot = html.match(/<meta name="googlebot" content="([^"]+)">/i)?.[1] || '';
  if (h1Count !== 1) errors.push(`${route}: expected one H1, found ${h1Count}`);
  if (canonicalCount !== 1) errors.push(`${route}: expected one canonical, found ${canonicalCount}`);
  if (robots !== googlebot) errors.push(`${route}: robots/googlebot conflict`);
  if (published.has(route) && !robots.startsWith('index, follow')) errors.push(`${route}: published route is noindex`);
  if (!published.has(route) && !robots.includes('noindex')) errors.push(`${route}: generated non-public route is indexable`);
  if (/href=["'][^"']*undefined/i.test(html)) errors.push(`${route}: literal undefined link`);

  const hrefs = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const href of hrefs) {
    if (!href.startsWith('/')) continue;
    const target = normalizedPath(href);
    if (published.has(target)) continue;
    const relative = target.replace(/^\//, '');
    const candidates = [path.join(dist, relative), path.join(dist, `${relative}.html`), path.join(dist, relative, 'index.html')];
    let exists = false;
    for (const candidate of candidates) {
      try { await stat(candidate); exists = true; break; } catch { /* try next representation */ }
    }
    if (!exists) errors.push(`${route}: broken internal link ${href}`);
  }

  const routeAlternates = [...html.matchAll(/<link\s+rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi)]
    .map((match) => ({ code: match[1], target: normalizedPath(new URL(match[2], 'https://alshafra.com').pathname) }));
  alternates.set(route, routeAlternates);

  if (route === '/admin') {
    if (!robots.includes('noindex') || !robots.includes('nofollow')) errors.push('/admin: missing strict noindex');
    if (html.includes('pagead2.googlesyndication.com')) errors.push('/admin: advertising script present');
  }
}

for (const [route, routeAlternates] of alternates) {
  for (const alternate of routeAlternates) {
    if (!published.has(alternate.target)) errors.push(`${route}: hreflang ${alternate.code} points to unpublished ${alternate.target}`);
    if (alternate.target !== route && !alternates.get(alternate.target)?.some((candidate) => candidate.target === route)) {
      errors.push(`${route}: hreflang target ${alternate.target} is not reciprocal`);
    }
  }
}

const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
const sitemapPaths = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => normalizedPath(new URL(match[1]).pathname)));
for (const route of published) if (!sitemapPaths.has(route)) errors.push(`sitemap: missing ${route}`);
for (const route of sitemapPaths) if (!published.has(route)) errors.push(`sitemap: contains non-published ${route}`);
if (sitemap.includes('<changefreq>') || sitemap.includes('<priority>')) errors.push('sitemap: obsolete changefreq/priority present');

for (const errorFile of ['404.html', '410.html']) {
  const html = await readFile(path.join(dist, errorFile), 'utf8');
  if (!/name="robots" content="[^"]*noindex/i.test(html)) errors.push(`${errorFile}: missing noindex`);
}

if (errors.length) {
  console.error(`[validate-build] ${errors.length} problem(s):\n- ${errors.slice(0, 100).join('\n- ')}`);
  process.exit(1);
}
console.log(`[validate-build] Passed: ${htmlFiles.length} generated routes, ${published.size} indexable routes, zero broken/undefined links, valid sitemap and hreflang.`);
