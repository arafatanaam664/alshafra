import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

const pub = JSON.parse(readFileSync(join(process.cwd(), 'apps/web/public/published.json'), 'utf8')) as {
  published: { path: string; title: string }[];
};
const twin = JSON.parse(readFileSync(join(process.cwd(), 'apps/web-legacy/public/published.json'), 'utf8')) as {
  published: { path: string; title: string }[];
};

if (pub.published.length !== 127) fail(`expected 127 titles, got ${pub.published.length}`);
if (twin.published.length !== 127) fail('legacy inventory drifted');

const seen = new Set<string>();
for (const row of pub.published) {
  if (seen.has(row.path)) fail(`duplicate ${row.path}`);
  seen.add(row.path);
  if (!row.title?.trim()) fail(`empty title ${row.path}`);
  if (/تقويم السعودية|شفرة تولز/.test(row.title)) fail(`old brand in title ${row.path}: ${row.title}`);
  if (row.path !== '/' && row.path !== '/about' && row.path !== '/contact' && !row.title.includes('Alshafra')) {
    fail(`missing Alshafra brand ${row.path}: ${row.title}`);
  }
  if (row.title.length > 80) fail(`title too long ${row.path} (${row.title.length})`);
}

const home = pub.published.find((row) => row.path === '/');
if (!home?.title.startsWith('Alshafra')) fail(`home title ${home?.title}`);
const today = pub.published.find((row) => row.path === '/today');
if (!today?.title.includes('التاريخ الهجري')) fail(`today title ${today?.title}`);
const about = pub.published.find((row) => row.path === '/about');
if (about?.title !== 'عن Alshafra') fail(`about title ${about?.title}`);

console.log(JSON.stringify({ ok: true, titles: pub.published.length, home: home?.title }, null, 2));
