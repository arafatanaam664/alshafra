#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const pubPath = join(process.cwd(), 'apps/web-legacy/public/published.json');
const data = JSON.parse(readFileSync(pubPath, 'utf8'));
const paths = (data.published || []).map((p) => p.path);
const unique = new Set(paths);

if (paths.length !== 127) {
  console.error(`Expected 127 published paths, got ${paths.length}`);
  process.exit(1);
}
if (unique.size !== 127) {
  console.error('Duplicate paths in published.json');
  process.exit(1);
}

const required = [
  '/',
  '/date-converter',
  '/hijri-calendar',
  '/today',
  '/salaries',
  '/school-calendar',
  '/holidays',
  '/countdown',
  '/age-calculator',
  '/articles',
];
for (const r of required) {
  if (!unique.has(r)) {
    console.error(`Missing required URL ${r}`);
    process.exit(1);
  }
}

console.log(`Legacy URL inventory ok: ${paths.length} unique published paths.`);
