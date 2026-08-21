#!/usr/bin/env node
/**
 * Package boundary + deep-import + secret-env scan.
 * Not a microservice checker — modules stay in-process.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const errors = [];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx|js|mjs)$/.test(name)) acc.push(p);
  }
  return acc;
}

const files = [
  ...walk(join(root, 'apps')),
  ...walk(join(root, 'packages')),
];

const forbiddenDeep = /from\s+['"]@alshafra\/[^'"]+\/src\//;
const relativeDeep = /from\s+['"](?:\.\.\/){3,}packages\//;
const serviceInWeb = /SUPABASE_SERVICE_ROLE/;

const uiPkgs = new Set(['ui']);
const uiForbidden = ['@alshafra/database', '@alshafra/social', '@alshafra/content'];

for (const file of files) {
  const rel = relative(root, file);
  const text = readFileSync(file, 'utf8');
  if (forbiddenDeep.test(text)) errors.push(`${rel}: deep package import (@alshafra/*/src/)`);
  if (relativeDeep.test(text)) errors.push(`${rel}: relative jump into packages/`);
  if ((rel.startsWith('apps/web/src') || rel.startsWith('apps/admin/src')) && serviceInWeb.test(text)) {
    errors.push(`${rel}: service role key referenced in browser src`);
  }
  if (rel.startsWith('packages/ui/') && uiForbidden.some((d) => text.includes(d))) {
    errors.push(`${rel}: ui package must not import ${uiForbidden.join(', ')}`);
  }
}

if (errors.length) {
  console.error('Boundary check failed:');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}
console.log(`Boundary check ok (${files.length} files, ui=${[...uiPkgs].join(',')}).`);
