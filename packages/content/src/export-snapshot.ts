import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import type { SqlClient } from '@alshafra/database';
import { publicObjectUrl } from '@alshafra/media';
import { selfCanonical } from '@alshafra/seo';
import { blocksToHtml, blocksToPlainText, escapeHtml, parseBlocks, passesQualityGate, wordCount } from './blocks';
import { applySectionOverrides, parseSectionOverrides, PLATFORM_SECTIONS, SECTIONS_SETTING_KEY } from './sections';
import { contentSnapshotSchema, type ContentSnapshot, type SnapshotRoute } from './snapshot';

const SITE = 'https://alshafra.com';

function asBlocks(value: unknown) {
  return parseBlocks(value);
}

function robotsPublic(value: string | null | undefined, qualityPass: boolean): SnapshotRoute['robots'] {
  if (!qualityPass) return 'noindex, follow';
  if (!value || value.startsWith('index')) return 'index, follow';
  return 'noindex, follow';
}

export function defaultSnapshotPath(repoRoot: string): string {
  return join(repoRoot, 'apps/web/src/data/cms-snapshot.json');
}

export function resolveSnapshotPath(): string {
  if (process.env.ALSHAFRA_SNAPSHOT_PATH) return process.env.ALSHAFRA_SNAPSHOT_PATH;
  const cwd = process.cwd();
  const candidates = [
    join(cwd, 'apps/web/src/data/cms-snapshot.json'),
    join(cwd, '../web/src/data/cms-snapshot.json'),
    join(cwd, '../../apps/web/src/data/cms-snapshot.json'),
  ];
  return candidates[0];
}

export async function buildPublicSnapshot(db: SqlClient, legacyPaths: Set<string> = new Set()): Promise<ContentSnapshot> {
  const docs = await db.query<{
    id: string;
    path: string;
    slug: string;
    title: string;
    excerpt: string | null;
    body_json: unknown;
    type: string;
    status: string;
    indexable: boolean;
    unique_text_word_count: number | null;
    legacy_path: string | null;
    seo_title: string | null;
    meta_description: string | null;
    canonical_url: string | null;
    robots: string | null;
    h1_override: string | null;
    featured_key: string | null;
    og_key: string | null;
    type_data_json: unknown;
  }>(
    `SELECT d.id, d.path, d.slug, d.title, d.excerpt, d.body_json, d.type::text AS type, d.status::text AS status,
            d.indexable, d.unique_text_word_count, d.legacy_path, d.type_data_json,
            s.seo_title, s.meta_description, s.canonical_url, s.robots::text AS robots, s.h1_override,
            fm.object_key AS featured_key, om.object_key AS og_key
     FROM documents d
     LEFT JOIN document_seo s ON s.document_id = d.id
     LEFT JOIN media fm ON fm.id = d.featured_media_id AND fm.deleted_at IS NULL
     LEFT JOIN media om ON om.id = s.og_image_media_id AND om.deleted_at IS NULL
     WHERE d.deleted_at IS NULL AND d.status = 'published'
     ORDER BY d.path`,
  );

  const faq = await db.query<{ document_id: string; question: string; answer: string }>(
    `SELECT document_id, question, answer FROM faq_items ORDER BY sort_order`,
  );
  const faqByDoc = new Map<string, { q: string; a: string }[]>();
  for (const row of faq.rows) {
    const list = faqByDoc.get(row.document_id) ?? [];
    list.push({ q: row.question, a: row.answer });
    faqByDoc.set(row.document_id, list);
  }

  const routes: SnapshotRoute[] = [];
  let qualityPassCount = 0;
  let newRoutes = 0;

  for (const doc of docs.rows) {
    const blocks = asBlocks(doc.body_json);
    const faqItems = faqByDoc.get(doc.id) ?? [];
    const html =
      blocksToHtml(blocks) +
      (faqItems.length
        ? `<section><h2>الأسئلة الشائعة</h2>${faqItems
            .map((item) => `<h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a)}</p>`)
            .join('')}</section>`
        : '');
    const unique =
      doc.unique_text_word_count && doc.unique_text_word_count > 0
        ? doc.unique_text_word_count
        : wordCount(blocksToPlainText(blocks));
    const description = doc.meta_description || doc.excerpt || '';
    const isLegacy = Boolean(doc.legacy_path) || legacyPaths.has(doc.path);
    const qualityPass = isLegacy ? true : passesQualityGate({ uniqueTextWordCount: unique, description, html });
    if (qualityPass) qualityPassCount += 1;
    if (!isLegacy) newRoutes += 1;
    routes.push({
      path: doc.path,
      slug: doc.slug,
      title: doc.seo_title || doc.title,
      h1: doc.h1_override || doc.title,
      description,
      robots: robotsPublic(doc.robots, qualityPass),
      canonicalUrl: doc.canonical_url || selfCanonical(doc.path, SITE),
      documentType: doc.type,
      status: doc.status,
      handlerKind: 'document',
      indexable: Boolean(doc.indexable) && qualityPass,
      kind: doc.type,
      html,
      isLegacy,
      uniqueTextWordCount: unique,
      qualityPass,
      image: publicObjectUrl(doc.og_key || doc.featured_key || '') || undefined,
    });
  }

  const setting = await db.query<{ value_json: unknown }>(
    `SELECT value_json FROM site_settings WHERE key = $1`,
    [SECTIONS_SETTING_KEY],
  );
  const sections = applySectionOverrides(PLATFORM_SECTIONS, parseSectionOverrides(setting.rows[0]?.value_json));

  const flagRows = await db.query<{ key: string; is_enabled: boolean }>(`SELECT key, is_enabled FROM feature_flags`);
  const flags = Object.fromEntries(flagRows.rows.map((row) => [row.key, row.is_enabled]));

  const { listingCanAppearPublic, parseListingData } = await import('./opportunities');
  const opportunityDocs = docs.rows.filter((doc) => ['job', 'scholarship', 'opportunity'].includes(doc.type));
  const opportunities = opportunityDocs
    .map((doc) => {
      const listing = parseListingData((doc as { type_data_json?: unknown }).type_data_json);
      return { doc, listing };
    })
    .filter((row) => listingCanAppearPublic({ published: row.doc.status === 'published', data: row.listing, flags }))
    .map((row) => ({
      path: row.doc.path,
      title: row.doc.seo_title || row.doc.title,
      description: row.doc.meta_description || row.doc.excerpt || '',
      html: blocksToHtml(asBlocks(row.doc.body_json)),
      kind: row.listing?.kind || 'other',
      sourceName: row.listing?.sourceName || '',
      country: row.listing?.country,
      deadline: row.listing?.deadline,
      applyUrl: row.listing?.applyUrl || undefined,
    }));

  let questions: { path: string; title: string; body: string; robots: 'noindex, follow' }[] = [];
  if (flags.community_enabled && flags.questions_enabled) {
    const q = await db.query<{ path: string; title: string; body: string }>(
      `SELECT path, title, body FROM questions WHERE deleted_at IS NULL AND status <> 'hidden' ORDER BY created_at DESC LIMIT 100`,
    );
    questions = q.rows.map((row) => ({ ...row, robots: 'noindex, follow' as const }));
  }

  const adsEnabled = Boolean(flags.ads_enabled);
  const adsClient = await db.query<{ value_json: unknown }>(`SELECT value_json FROM site_settings WHERE key = 'ads.client'`);
  const slots = adsEnabled
    ? (
        await db.query<{ key: string; adsense_slot_id: string | null }>(
          `SELECT key, adsense_slot_id FROM ad_slots WHERE adsense_slot_id IS NOT NULL AND adsense_slot_id <> ''`,
        )
      ).rows.map((row) => ({ key: row.key, slotId: String(row.adsense_slot_id) }))
    : [];

  return contentSnapshotSchema.parse({
    generatedAt: new Date().toISOString(),
    siteUrl: SITE,
    routes,
    counts: {
      published: routes.length,
      qualityPass: qualityPassCount,
      newRoutes,
      opportunities: opportunities.length,
      questions: questions.length,
    },
    sections,
    flags,
    opportunities,
    questions,
    ads: {
      enabled: adsEnabled && Boolean(adsClient.rows[0]?.value_json) && slots.length > 0,
      client: typeof adsClient.rows[0]?.value_json === 'string' ? adsClient.rows[0]?.value_json : undefined,
      slots,
    },
  });
}

export function writePublicSnapshot(snapshot: ContentSnapshot, dest: string): void {
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, `${JSON.stringify(snapshot, null, 2)}\n`);
}

export async function refreshPublicSnapshot(db: SqlClient, dest = resolveSnapshotPath(), legacyPaths?: Set<string>) {
  const snapshot = await buildPublicSnapshot(db, legacyPaths);
  writePublicSnapshot(snapshot, dest);
  return { dest, routes: snapshot.routes.length, counts: snapshot.counts };
}
