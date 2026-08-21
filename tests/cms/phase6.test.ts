import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { applyMigrations, fromPglite, seedDatabase } from '@alshafra/database';
import { createDocument, provisionStaff, transitionDocument, updateDocument } from '@alshafra/cms';
import { QUALITY_INDEX_MIN_WORDS } from '@alshafra/content';
import { importLegacyContent } from '../../packages/content/src/legacy-import';
import { mergeLegacyAndSnapshot as mergePages, type PublicPage } from '../../packages/content/src/snapshot';
import { buildPublicSnapshot as exportSnapshot } from '../../packages/content/src/export-snapshot';

const root = process.cwd();

function fail(msg: string): never {
  console.error(msg);
  process.exit(1);
}

function words(n: number): string {
  return Array.from({ length: n }, (_, i) => `كلمة${i + 1}`).join(' ');
}

async function main() {
  process.env.ALSHAFRA_ENV = 'development';
  process.env.ADMIN_DEV_LOGIN = 'true';
  process.env.ADMIN_SESSION_SECRET = 'test-secret-phase6';
  const snapFile = join(mkdtempSync(join(tmpdir(), 'alshafra-p6-')), 'snapshot.json');
  process.env.ALSHAFRA_SNAPSHOT_PATH = snapFile;

  const { PGlite } = await import('@electric-sql/pglite');
  const db = new PGlite();
  const client = fromPglite(db);
  await applyMigrations(client);
  await seedDatabase(client);
  await importLegacyContent(client, root);

  const published = JSON.parse(
    await import('node:fs').then((fs) => fs.readFileSync(join(root, 'apps/web-legacy/public/published.json'), 'utf8')),
  ) as { published: { path: string; title: string; kind: string }[] };
  const legacyPaths = new Set(published.published.map((row) => row.path));
  const legacyPages: PublicPage[] = published.published.map((row) => ({
    path: row.path,
    title: row.title,
    description: row.title,
    h1: row.title.split('|')[0].trim(),
    robots: 'index, follow',
    kind: row.kind,
    html: '<p>legacy</p>',
  }));

  const editor = await provisionStaff(client, 'editor@local.test', 'editor');

  const thin = await createDocument(client, editor, {
    type: 'article',
    title: 'مقال قصير للتجربة',
    excerpt: 'وصف قصير',
    body: [{ type: 'p', text: 'فقرة واحدة فقط.' }],
  });
  await transitionDocument(client, editor, thin.id, 'review');
  await transitionDocument(client, editor, thin.id, 'published');

  const richBody = words(QUALITY_INDEX_MIN_WORDS + 20);
  const rich = await createDocument(client, editor, {
    type: 'solution',
    title: 'حل مشكلة تجريبية طويلة',
    excerpt: 'وصف ميتا طويل بما يكفي لاجتياز حد الوصف في بوابة الجودة الخاصة بالمرحلة السادسة.',
    body: [{ type: 'p', text: richBody }],
  });
  await updateDocument(client, editor, rich.id, {
    seoTitle: 'حل مشكلة تجريبية طويلة',
    metaDescription: 'وصف ميتا طويل بما يكفي لاجتياز حد الوصف في بوابة الجودة الخاصة بالمرحلة السادسة.',
    body: [{ type: 'p', text: richBody }],
  });
  await transitionDocument(client, editor, rich.id, 'review');
  await transitionDocument(client, editor, rich.id, 'published');

  const snapshot = await exportSnapshot(client, legacyPaths);
  writeFileSync(snapFile, JSON.stringify(snapshot));

  const homeSnap = snapshot.routes.find((r) => r.path === '/');
  if (!homeSnap?.isLegacy) fail('legacy home must be marked isLegacy');

  const merged = mergePages(legacyPages, snapshot, 'composite');
  if (merged.length < 129) fail(`expected 127 + 2 new pages, got ${merged.length}`);
  if (!merged.some((p) => p.path === '/date-converter')) fail('missing /date-converter');
  const home = merged.find((p) => p.path === '/');
  if (!home || home.title !== published.published.find((p) => p.path === '/')?.title) {
    fail('composite must not rewrite legacy homepage title');
  }

  const thinPage = merged.find((p) => p.path === thin.path);
  const richPage = merged.find((p) => p.path === rich.path);
  if (!thinPage) fail('thin published page missing from composite');
  if (thinPage.robots !== 'noindex, follow') fail(`thin page must stay noindex, got ${thinPage.robots}`);
  if (!richPage) fail('quality page missing');
  if (richPage.robots !== 'index, follow') fail(`quality page should be indexable, got ${richPage.robots}`);
  if (!richPage.html.includes('كلمة1')) fail('quality page html missing body');

  const sitemapish = merged.filter((p) => p.robots.startsWith('index'));
  if (sitemapish.some((p) => p.path === thin.path)) fail('thin page leaked into sitemap set');
  if (!sitemapish.some((p) => p.path === '/date-converter')) fail('legacy HIGH path dropped from sitemap set');

  try {
    mergePages(
      [
        ...legacyPages,
        {
          path: '/legacy-not-in-snapshot',
          title: 'x',
          description: 'x',
          h1: 'x',
          robots: 'index, follow',
          kind: 'article',
          html: '<p>x</p>',
        },
      ],
      snapshot,
      'database',
    );
    fail('database mode must reject incomplete snapshot of 127');
  } catch (err) {
    if (!(err instanceof Error) || !err.message.includes('missing legacy')) fail(`wrong database error: ${err}`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        legacy: 127,
        merged: merged.length,
        thin: thin.path,
        thinRobots: thinPage.robots,
        rich: rich.path,
        richRobots: richPage.robots,
        snapshotRoutes: snapshot.routes.length,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
