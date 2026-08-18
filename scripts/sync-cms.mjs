import { createClient } from '@supabase/supabase-js';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

// Safety brake for the legacy scheduled workflow. The repository connection
// cannot edit workflow files without GitHub's workflows permission, so even an
// old remote schedule must fail before it can build, commit, or submit URLs.
if (process.env.GITHUB_WORKFLOW === 'Daily auto-publish') {
  console.error('[cms:sync] Legacy automatic publishing is disabled. Use a reviewed deployment instead.');
  process.exit(1);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputPath = path.join(root, 'src/data/cms-content.json');
const temporaryPath = `${outputPath}.tmp`;
const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const required = process.env.CMS_SYNC_REQUIRED === 'true';

function fail(message) {
  console.error(`[cms:sync] ${message}`);
  process.exit(1);
}

async function preserveLocalCache() {
  try {
    const current = JSON.parse(await readFile(outputPath, 'utf8'));
    console.log(`[cms:sync] Supabase server credentials are absent; preserved ${current.items?.length || 0} cached item(s).`);
  } catch {
    fail('Supabase credentials are absent and the tracked CMS cache is unreadable.');
  }
}

if (!url || !serviceRoleKey) {
  if (required) fail('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for this deployment.');
  await preserveLocalCache();
  process.exit(0);
}

if (serviceRoleKey === process.env.VITE_SUPABASE_ANON_KEY) {
  fail('The service-role key must not be the public anonymous key.');
}

const client = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  global: { headers: { 'X-Client-Info': 'alshafra-build-cms-sync' } },
});

const { data, error } = await client
  .from('content_items')
  .select('id,type,status,locale,canonical_path,slug,title,seo_title,description,body_markdown,keywords,sources,cover_image_url,cover_image_alt,author_name,reviewer_name,indexable,published_at,reviewed_at,updated_at,metadata')
  .eq('status', 'published')
  .eq('indexable', true)
  .not('published_at', 'is', null)
  .lte('published_at', new Date().toISOString())
  .order('published_at', { ascending: false });

if (error) fail(`Database export failed: ${error.message}`);

const reservedPaths = new Set(['/admin', '/404', '/404.html']);
const seen = new Set();
const items = [];
for (const item of data || []) {
  const canonicalPath = item.canonical_path?.length > 1
    ? item.canonical_path.replace(/\/+$/, '')
    : item.canonical_path;
  if (!canonicalPath?.startsWith('/') || canonicalPath.includes('undefined') || reservedPaths.has(canonicalPath) || canonicalPath.startsWith('/admin/')) {
    fail(`Rejected invalid or reserved canonical path for content ${item.id}: ${canonicalPath}`);
  }
  if (seen.has(canonicalPath)) fail(`Rejected duplicate canonical path: ${canonicalPath}`);
  if (!item.title?.trim() || !item.description?.trim() || !item.body_markdown?.trim()) {
    fail(`Published content ${item.id} is structurally incomplete.`);
  }
  if (!Array.isArray(item.sources) || item.sources.length === 0) {
    fail(`Published content ${item.id} has no source records.`);
  }
  for (const source of item.sources) {
    if (!source?.label?.trim() || !/^https:\/\//i.test(source.url || '')) {
      fail(`Published content ${item.id} contains a malformed or non-HTTPS source.`);
    }
  }
  if (!item.reviewer_name?.trim()) fail(`Published content ${item.id} has no named reviewer.`);
  if (item.cover_image_url && !item.cover_image_alt?.trim()) {
    fail(`Published content ${item.id} has a cover image without alt text.`);
  }
  seen.add(canonicalPath);
  items.push({ ...item, canonical_path: canonicalPath });
}

const exported = {
  generatedAt: new Date().toISOString(),
  source: 'supabase-reviewed-publications',
  items,
};
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(temporaryPath, `${JSON.stringify(exported, null, 2)}\n`, { mode: 0o600 });
await rename(temporaryPath, outputPath);
console.log(`[cms:sync] Exported ${items.length} reviewed, published, indexable item(s).`);
