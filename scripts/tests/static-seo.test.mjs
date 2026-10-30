import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { preview } from 'vite';

const dist = resolve('dist');
const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const exists = path => existsSync(path) && statSync(path).isFile();
const fileFor = path => path === '/' ? join(dist, 'index.html') : join(dist, path, 'index.html');
const readPage = url => readFileSync(fileFor(new URL(url).pathname), 'utf8');

test('sitemap contains distinct, built canonical pages with one title, H1, and description', () => {
  assert.ok(urls.length > 0);
  assert.equal(new Set(urls).size, urls.length);
  const titles = new Set();
  for (const url of urls) {
    assert.equal(new URL(url).origin, 'https://alshafra.com');
    const html = readPage(url);
    const tags = html.match(/<h1(?:\s[^>]*)?>/gi) || [];
    assert.equal(tags.length, 1, `${url}: H1 count`);
    const title = [...html.matchAll(/<title>([^<]+)<\/title>/gi)];
    assert.equal(title.length, 1, `${url}: title count`);
    assert.ok(!titles.has(title[0][1]), `${url}: duplicate title`);
    titles.add(title[0][1]);
    const canonicals = [...html.matchAll(/<link\s+rel="canonical"\s+href="([^"]+)"\s*\/?\s*>/gi)];
    assert.equal(canonicals.length, 1, `${url}: canonical count`);
    assert.equal(canonicals[0][1].replace(/\/$/, ''), url.replace(/\/$/, ''), `${url}: canonical mismatch`);
    assert.equal((html.match(/<meta\s+name="description"/gi) || []).length, 1, `${url}: description count`);
    assert.doesNotMatch(html, /<meta\s+name="robots"\s+content="[^"]*noindex/i, `${url}: noindex`);
  }
});

test('internal links in prerendered HTML point to existing built files', () => {
  const problems = [];
  for (const url of urls) {
    const html = readPage(url);
    for (const [, raw] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi)) {
      const link = new URL(raw.replaceAll('&amp;', '&'), url);
      if (link.origin !== 'https://alshafra.com') continue;
      const pathname = decodeURIComponent(link.pathname);
      const file = resolve(dist, `.${pathname}`);
      if (!file.startsWith(dist + '/') && file !== dist) { problems.push(`${url} -> ${raw}`); continue; }
      if (!exists(file) && !exists(join(file, 'index.html'))) problems.push(`${url} -> ${raw}`);
    }
  }
  assert.deepEqual(problems, []);
});

test('static today and countdown HTML do not present build-time days as current', () => {
  const today = readPage('https://alshafra.com/today');
  assert.match(today, /يتطلب عرض التاريخ المتجدد تشغيل JavaScript/);
  assert.match(readPage('https://alshafra.com/countdown'), /عدّ تنازلي لتاريخ تختاره/);
  assert.match(readPage('https://alshafra.com/countdown'), /يتطلب تشغيل الأداة JavaScript/);
  for (const path of ['/countdown', '/countdown/ramadan']) {
    assert.doesNotMatch(readPage(`https://alshafra.com${path}`), /باقٍ\s+\d+/);
  }
});

test('preview returns 404/410 and existing redirect rather than SPA soft 404', async () => {
  const server = await preview({ configFile: resolve('vite.config.ts'), preview: { host: '127.0.0.1', port: 0 } });
  after(() => new Promise(resolveClose => server.httpServer.close(resolveClose)));
  const { port } = server.httpServer.address();
  const request = path => fetch(`http://127.0.0.1:${port}${path}`, { redirect: 'manual' });
  assert.equal((await request('/salaries')).status, 200);
  assert.equal((await request('/missing-page-for-test')).status, 404);
  assert.equal((await request('/category/old')).status, 410);
  const redirect = await request('/index.html');
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get('location'), '/');
});

test('tool guides and cross-links are present in prerendered pages', () => {
  assert.match(readPage('https://alshafra.com/age-calculator'), /مقارنة العمر بين شخصين/);
  assert.match(readPage('https://alshafra.com/age-calculator'), /تتطلب المقارنة تشغيل JavaScript/);
  const guides = JSON.parse(readFileSync(new URL('../../src/data/tool-guides.json', import.meta.url), 'utf8'));
  for (const [path, key, related] of [['/age-calculator', 'age', '/date-converter'], ['/date-converter', 'converter', '/age-calculator']]) {
    const html = readPage(`https://alshafra.com${path}`);
    for (const item of guides[key]) { assert.ok(html.includes(item.question), `${path}: question`); assert.ok(html.includes(item.answer), `${path}: answer`); }
    assert.ok(html.includes(`href="${related}"`));
    assert.ok(html.includes('href="/today"'));
    assert.ok(html.includes('href="/hijri-calendar"'));
  }
});


test('approved contact details and editorial responsibility appear in static pages', () => {
  const contact = JSON.parse(readFileSync(new URL('../../src/data/site-contact.json', import.meta.url), 'utf8'));
  for (const path of ['/contact', '/about', '/faq', '/privacy']) {
    const html = readPage(`https://alshafra.com${path}`);
    assert.ok(html.includes(contact.email), path);
    assert.doesNotMatch(html, /info@alshafra\.com/, path);
  }
  assert.ok(readPage('https://alshafra.com/about').includes(contact.editorialTeam));
  assert.match(readPage('https://alshafra.com/contact'), /mailto:runcode\.company@gmail\.com/);
  for (const url of urls) assert.match(readPage(url), /<meta name="mitgo-verification"/);
});

test('built date-input pages use restrictive CSP and exclude external executable resources', () => {
  for (const path of ['/age-calculator', '/date-converter', '/countdown']) {
  const html = readPage(`https://alshafra.com${path}`);
  assert.match(html, /http-equiv="Content-Security-Policy"/);
  assert.match(html, /script-src 'self'/);
  assert.match(html, /connect-src 'self'/);
  assert.doesNotMatch(html, /<script\b[^>]*\bsrc="https:\/\//i);
  assert.doesNotMatch(html, /window\.dataLayer/);
  assert.doesNotMatch(html, /<link\b[^>]*\bhref="https:\/\/(?:fonts\.googleapis\.com|fonts\.gstatic\.com|bauval\.org|araplhn\.org)/i);
  }
  assert.match(readPage('https://alshafra.com/'), /googletagmanager\.com/);
});
