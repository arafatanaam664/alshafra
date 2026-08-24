#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dist = join(root, 'apps/web/dist');
const extra = ['/about', '/contact', '/privacy', '/terms', '/faq', '/calendar', '/tools', '/search', '/404'];

function fileFor(path) {
  if (path === '/') return join(dist, 'index.html');
  if (path === '/404') return join(dist, '404.html');
  return join(dist, path.replace(/^\//, ''), 'index.html');
}

function stripScripts(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}

if (!existsSync(dist)) {
  console.error('Astro dist missing. Run npm run build first.');
  process.exit(1);
}

const missing = [];
const visibleOld = [];
for (const path of extra) {
  const file = path === '/404' ? join(dist, '404.html') : fileFor(path);
  if (!existsSync(file)) {
    missing.push(path);
    continue;
  }
  const visible = stripScripts(readFileSync(file, 'utf8'));
  if (visible.includes('تقويم السعودية') || visible.includes('شفرة تولز')) visibleOld.push(path);
}

const gone = existsSync(join(dist, '410.html'));
const robots = existsSync(join(dist, 'robots.txt')) ? readFileSync(join(dist, 'robots.txt'), 'utf8') : '';
if (robots.includes('previous incarnation')) visibleOld.push('robots.txt');

function walkHtml(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === '_astro' || name === 'assets') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkHtml(p, acc);
    else if (name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

const leakPages = [];
for (const file of walkHtml(dist)) {
  const visible = stripScripts(readFileSync(file, 'utf8'));
  if (visible.includes('تقويم السعودية') || visible.includes('شفرة تولز') || visible.includes('previous incarnation')) {
    leakPages.push(file.replace(`${root}/`, ''));
  }
}

const report = [
  '# Phase 16 — public pages beyond the 127',
  '',
  'Date: 2026-08-24',
  '',
  `- Extra required pages missing: ${missing.length ? missing.join(', ') : 'none'}`,
  `- Visible old brand on extra pages: ${visibleOld.length ? visibleOld.join(', ') : 'none'}`,
  `- Visible old brand anywhere in HTML (scripts stripped): ${leakPages.length}`,
  `- 410.html: ${gone ? 'present' : 'MISSING'}`,
  '',
];
writeFileSync(join(root, 'docs/execution/16-public-pages-audit.md'), `${report.join('\n')}\n`);

if (missing.length || visibleOld.length || leakPages.length || !gone) {
  console.error({ missing, visibleOld, leakPages: leakPages.slice(0, 20) });
  process.exit(1);
}
console.log('Public extra pages ok: about/contact/privacy/terms/faq/calendar/tools/search/404/410, no visible old brand.');
