import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';
import { matchRoute } from '../../src/lib/route-match.mjs';

const articles = JSON.parse(readFileSync('src/data/articles.json', 'utf8')).map(a => a.slug);
const countdowns = JSON.parse(readFileSync('src/data/countdowns.json', 'utf8')).countdowns.map(c => c.slug);
const match = path => matchRoute(path, articles, countdowns);

test('every built sitemap path matches an actual client route', () => {
  const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(m[1]).pathname);
  for (const path of paths) assert.notEqual(match(path).name, 'not-found', path);
});

test('unknown paths and extra segments do not render a known page', () => {
  for (const path of ['/made-up', '/today/extra', '/articles/unknown', '/countdown/unknown', '/name-decoration/missing', '/countdown/ramadan/extra', '/salaries//anything']) {
    assert.equal(match(path).name, 'not-found', path);
  }
  assert.equal(match('/salaries/').name, 'salaries');
  assert.deepEqual(match('/countdown/ramadan'), { name: 'countdown', param: 'ramadan' });
});

test('all actual name-decoration slugs resolve', async () => {
  const result = await build({ entryPoints: ['src/lib/decoration.ts'], bundle: true, write: false, format: 'esm', platform: 'node' });
  const { DECORATION_TOOLS } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
  for (const tool of DECORATION_TOOLS) assert.deepEqual(match(`/name-decoration/${tool.slug}`), { name: 'name-decoration', param: tool.slug });
});

test('static HTML has a working skip target and no unsupported search action', () => {
  const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
  for (const [, url] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const path = new URL(url).pathname;
    const html = readFileSync(`dist${path === '/' ? '' : path}/index.html`, 'utf8');
    assert.match(html, /href="#main-content"/);
    assert.match(html, /<main id="main-content"/);
    assert.doesNotMatch(html, /"@type"\s*:\s*"SearchAction"/);
  }
});
