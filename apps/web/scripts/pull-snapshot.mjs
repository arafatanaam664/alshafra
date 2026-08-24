#!/usr/bin/env node
/**
 * Optional prebuild: download the latest public snapshot into the Astro tree.
 * If ALSHAFRA_SNAPSHOT_URL is unset, the committed file is used.
 * Never prints tokens.
 */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dest =
  process.env.ALSHAFRA_SNAPSHOT_PATH ||
  resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/cms-snapshot.json');
const url = (process.env.ALSHAFRA_SNAPSHOT_URL || '').trim();

if (!url) {
  console.log('[snapshot] using the snapshot file already in the repository');
  process.exit(0);
}

try {
  const headers = { accept: 'application/json' };
  if (process.env.ALSHAFRA_SNAPSHOT_TOKEN) {
    headers.authorization = `Bearer ${process.env.ALSHAFRA_SNAPSHOT_TOKEN}`;
  }
  const response = await fetch(url, { headers });
  if (!response.ok) {
    console.log(`[snapshot] remote snapshot unavailable (${response.status}); using repository file`);
    process.exit(0);
  }
  const text = await response.text();
  JSON.parse(text);
  writeFileSync(dest, text.endsWith('\n') ? text : `${text}\n`);
  console.log('[snapshot] remote snapshot written for this build');
} catch {
  console.log('[snapshot] remote snapshot failed; using repository file');
  process.exit(0);
}
