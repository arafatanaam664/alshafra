import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const readJson = async (relativePath) => JSON.parse(await readFile(path.join(root, relativePath), 'utf8'));
const manifest = await readJson('public/published.json');
const cms = await readJson('src/data/cms-content.json');
const faults = await readJson('src/data/fault-codes.json');
const paths = new Set((manifest.published || []).map((item) => item.path));

for (const item of cms.items || []) {
  if (item.status === 'published' && item.indexable) paths.add(item.canonical_path);
}
for (const item of faults.faultCodes || []) {
  if (item.status !== 'published') continue;
  paths.add('/fault-codes');
  paths.add(`/fault-codes/${item.deviceSlug}`);
  paths.add(`/fault-codes/${item.deviceSlug}/${item.brandSlug}`);
  paths.add(`/fault-codes/${item.deviceSlug}/${item.brandSlug}/${item.slug}`);
}

const normalized = [...paths]
  .map((value) => value.length > 1 ? value.replace(/\/+$/, '') : value)
  .filter((value) => value.startsWith('/') && !value.includes('undefined'))
  .sort((a, b) => a.localeCompare(b));
await writeFile(path.join(root, 'src/data/published-paths.json'), `${JSON.stringify({ paths: normalized }, null, 2)}\n`);
console.log(`[publication-paths] Prepared ${normalized.length} allowed client link targets.`);
