#!/usr/bin/env node
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = process.cwd();
const pub = JSON.parse(readFileSync(join(root, 'apps/web/public/published.json'), 'utf8'));
const dist = join(root, 'apps/web/dist');
const reportPath = join(root, 'docs/execution/15-127-url-verification.md');

const LEAKS = [
  'شركة عالمية',
  'الموقع السابق',
  'الموقع القديم',
  'ثمانية أعمدة',
  'ليست هوية منفصلة',
  'لماذا تغيّر الشكل',
  'تم تحويل الموقع',
  'لا مواقع متفرقة',
  'قسم داخلها',
  'التقويم كان موقعًا سابقًا',
  'التقويم كان موقعاً سابقاً',
  'previous incarnation',
  'Feature flag',
  'Modular Monolith',
];

function fileFor(path) {
  return path === '/' ? join(dist, 'index.html') : join(dist, path.replace(/^\//, ''), 'index.html');
}

function pick(html, re) {
  return html.match(re)?.[1] || '';
}

function leaksIn(html) {
  return LEAKS.filter((phrase) => html.includes(phrase));
}

function escapeCell(value) {
  return String(value || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function collectPublicText(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === '_astro' || name === 'assets') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) collectPublicText(p, acc);
    else if (name.endsWith('.html') || name === 'robots.txt') acc.push(p);
  }
  return acc;
}

if (!existsSync(dist)) {
  console.error('Astro dist missing. Run npm run build first.');
  process.exit(1);
}

const rows = [];
const missing = [];
const problems = [];

for (const item of pub.published) {
  const file = fileFor(item.path);
  if (!existsSync(file)) {
    missing.push(item.path);
    rows.push({
      path: item.path,
      file: false,
      title: '',
      h1: false,
      canonical: '',
      robots: '',
      jsonld: false,
      og: false,
      leaks: [],
      notes: 'missing output',
    });
    continue;
  }
  const html = readFileSync(file, 'utf8');
  const title = pick(html, /<title>([^<]*)<\/title>/i);
  const description = pick(html, /name="description" content="([^"]*)"/i);
  const canonical = pick(html, /rel="canonical" href="([^"]+)"/i);
  const robots = pick(html, /name="robots" content="([^"]+)"/i);
  const h1 = /<h1[\s\S]*?>[\s\S]*?<\/h1>/i.test(html);
  const jsonld = html.includes('application/ld+json');
  const og = html.includes('og:title');
  const leaks = leaksIn(html);
  const notes = [];
  if (!title) notes.push('missing title');
  if (!description) notes.push('missing description');
  if (!canonical.includes('alshafra.com') || (item.path !== '/' && canonical.endsWith('/'))) {
    notes.push(`canonical ${canonical || 'empty'}`);
  }
  if (robots.toLowerCase().includes('noindex') && !['/404', '/410'].includes(item.path)) {
    notes.push(`accidental noindex (${robots})`);
  }
  if (!h1) notes.push('missing h1');
  if (!jsonld) notes.push('missing json-ld');
  if (!og) notes.push('missing og');
  if (leaks.length) notes.push(`leak:${leaks.join(',')}`);
  if (/<meta[^>]+http-equiv="refresh"/i.test(html)) notes.push('meta refresh');
  if (notes.length) problems.push(`${item.path}: ${notes.join('; ')}`);
  rows.push({
    path: item.path,
    file: true,
    title,
    h1,
    canonical,
    robots,
    jsonld,
    og,
    leaks,
    notes: notes.join('; ') || 'ok',
  });
}

const extras = ['/tools', '/calendar', '/search', '/tool/percentage'];
const extraMissing = extras.filter((path) => !existsSync(fileFor(path)));
const searchHtml = existsSync(fileFor('/search')) ? readFileSync(fileFor('/search'), 'utf8') : '';
if (searchHtml && !/noindex/i.test(searchHtml)) problems.push('/search must stay noindex');

const leakHits = [];
for (const file of collectPublicText(dist)) {
  const found = leaksIn(readFileSync(file, 'utf8'));
  if (found.length) leakHits.push(`${file.replace(`${root}/`, '')}: ${found.join(', ')}`);
}

const lines = [
  '# Phase 15 — 127 URL verification',
  '',
  'Date: 2026-08-24',
  `Source inventory: \`apps/web/public/published.json\` (${pub.published.length} paths)`,
  'Build output: `apps/web/dist`',
  '',
  'This report is from the generated HTML, not from the JSON inventory alone.',
  '',
  `- Generated: ${rows.filter((row) => row.file).length}/127`,
  `- Missing: ${missing.length}`,
  `- SEO/leak issues: ${problems.length}`,
  `- Extra hubs missing: ${extraMissing.length ? extraMissing.join(', ') : 'none'}`,
  `- Public leak hits: ${leakHits.length}`,
  '',
  'Homepage title may differ from `published.json` (product lock). Inner HIGH titles were not rewritten.',
  '',
  '| Path | File | Title | H1 | Canonical | Robots | JSON-LD | OG | Leaks | Notes |',
  '|---|---|---|---|---|---|---|---|---|---|',
];

for (const row of rows) {
  lines.push(
    `| \`${row.path}\` | ${row.file ? 'yes' : 'NO'} | ${escapeCell(row.title)} | ${row.h1 ? 'yes' : 'NO'} | ${escapeCell(row.canonical)} | ${escapeCell(row.robots)} | ${row.jsonld ? 'yes' : 'NO'} | ${row.og ? 'yes' : 'NO'} | ${row.leaks.length ? row.leaks.join(', ') : ''} | ${escapeCell(row.notes)} |`,
  );
}

if (missing.length) {
  lines.push('', '## Missing');
  for (const path of missing) lines.push(`- ${path}`);
}
if (problems.length) {
  lines.push('', '## Issues');
  for (const item of problems) lines.push(`- ${item}`);
}
if (leakHits.length) {
  lines.push('', '## Leak scan (HTML + robots.txt)');
  for (const item of leakHits) lines.push(`- ${item}`);
}

mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, `${lines.join('\n')}\n`);

if (missing.length || extraMissing.length || leakHits.length) {
  console.error(`127 verification failed. missing=${missing.length} extra=${extraMissing.length} leaks=${leakHits.length}`);
  if (missing.length) console.error(missing.slice(0, 10));
  if (leakHits.length) console.error(leakHits.slice(0, 10));
  process.exit(1);
}

const seoBlockers = problems.filter((item) => /missing title|missing h1|accidental noindex|canonical /.test(item));
if (seoBlockers.length) {
  console.error('127 SEO blockers', seoBlockers.slice(0, 20), seoBlockers.length);
  process.exit(1);
}

console.log(`127 URL verification ok: ${rows.length} HTML files. Report: docs/execution/15-127-url-verification.md`);
