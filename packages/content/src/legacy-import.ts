import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { hijriToGregorian } from '@alshafra/calendar';
import { IDS } from '@alshafra/database';
import type { DocumentType, HandlerKind, SqlClient } from '@alshafra/database';
import { newId } from '@alshafra/kernel';
import { normalizeArabic } from '@alshafra/search';
import { selfCanonical } from '@alshafra/seo';
import { LEGACY_TOOLS } from '@alshafra/tools';
import { blocksToPlainText, wordCount, type BodyBlock } from './blocks';
import { classify } from './legacy-classify';
import type { ContentSnapshot, SnapshotRoute } from './snapshot';

const SITE = 'https://alshafra.com';

export interface ImportCounts {
  documents: number;
  routes: number;
  tools: number;
  faq: number;
  sources: number;
  revisions: number;
  countdowns: number;
  priceSnapshots: number;
  calendarEvents: number;
  tags: number;
}

interface PublishedRow {
  path: string;
  title: string;
  lang?: string;
  kind: string;
}

interface Article {
  slug: string;
  title: string;
  seoTitle?: string;
  description: string;
  category?: string;
  sections: { heading: string; body: string }[];
  faq?: { q: string; a: string }[];
  sources?: { label: string; url: string }[];
  reviewedAt?: string;
  updatedAt?: string;
  keywords?: string;
}

interface CountdownDef {
  slug: string;
  title: string;
  question: string;
  category: string;
  emoji?: string;
  summary: string;
  keywords?: string;
  paragraphs: string[];
  notes: string[];
  faq: { q: string; a: string }[];
  related?: string[];
  schedule: Record<string, unknown>;
}

interface Topic {
  slug: string;
  category: string;
  title: string;
  description: string;
  intro: string[];
  sections: { heading: string; paragraphs: string[] }[];
  faq?: { q: string; a: string }[];
  related?: string[];
  facts?: [string, string][];
  keywords?: string;
}

interface Country {
  slug: string;
  ar?: string;
  en: string;
  cur: string;
  curName: string;
  langs?: string[];
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(file, 'utf8')) as T;
}

function slugOf(path: string): string {
  if (path === '/') return 'home';
  return path.split('/').filter(Boolean).pop() || path;
}

function categoryIdFor(path: string, articleCategory?: string): string | null {
  if (articleCategory === 'salaries') return IDS.catSalaries;
  if (articleCategory === 'calendar') return IDS.catCalendar;
  if (articleCategory === 'holidays') return IDS.catHolidays;
  if (articleCategory === 'tools') return IDS.catTools;
  if (articleCategory === 'support') return IDS.catSupport;
  if (path.startsWith('/articles')) return IDS.catArticles;
  if (path.startsWith('/countdown')) return IDS.catCountdown;
  if (path.startsWith('/trending')) return IDS.catTrending;
  if (path.startsWith('/gold-price')) return IDS.catGold;
  if (path.startsWith('/usd-rate')) return IDS.catUsd;
  if (path === '/privacy' || path === '/terms') return IDS.catLegal;
  if (['/today', '/hijri-calendar', '/school-calendar', '/holidays', '/salaries'].includes(path)) {
    if (path === '/salaries') return IDS.catSalaries;
    if (path === '/holidays') return IDS.catHolidays;
    return IDS.catCalendar;
  }
  if (path === '/date-converter' || path === '/age-calculator') return IDS.catTools;
  if (path === '/') return IDS.catHome;
  return null;
}

async function one<T>(client: SqlClient, sql: string, params: unknown[]): Promise<T | undefined> {
  const r = await client.query<T>(sql, params);
  return r.rows[0];
}

async function upsertDocument(
  client: SqlClient,
  input: {
    path: string;
    type: DocumentType;
    title: string;
    h1: string;
    excerpt: string;
    blocks: BodyBlock[];
    sourceFile: string;
    categoryId: string | null;
    reviewedAt?: string;
    updatedAt?: string;
    keywords?: string | string[];
    typeData?: Record<string, unknown>;
    indexable?: boolean;
  },
): Promise<{ id: string; created: boolean; revised: boolean }> {
  const slug = slugOf(input.path);
  const body = JSON.stringify(input.blocks);
  const typeData = JSON.stringify(input.typeData ?? {});
  const plain = blocksToPlainText(input.blocks);
  const existing = await one<{ id: string; body_json: unknown }>(client, 'SELECT id, body_json FROM documents WHERE path = $1', [
    input.path,
  ]);
  const id = existing?.id ?? newId();
  const publishedAt = input.reviewedAt || input.updatedAt || '2026-08-20T00:00:00Z';
  const params = [
    id,
    input.type,
    input.h1,
    slug,
    input.path,
    input.sourceFile,
    input.excerpt,
    body,
    typeData,
    IDS.authorAlshafra,
    input.categoryId,
    publishedAt,
    input.reviewedAt ?? null,
    input.indexable !== false,
    wordCount(plain),
    normalizeArabic(input.h1),
    normalizeArabic(plain).slice(0, 20000),
  ];
  if (!existing) {
    await client.query(
      `INSERT INTO documents (
         id, type, status, locale, title, slug, path, legacy_path, legacy_source_file, imported_at,
         excerpt, body_json, type_data_json, author_id, category_id, published_at, reviewed_at,
         indexable, unique_text_word_count, title_normalized, body_normalized
       ) VALUES (
         $1,$2::document_type,'published','ar',$3,$4,$5,$5,$6,now(),
         $7,$8::jsonb,$9::jsonb,$10,$11,$12::timestamptz,$13::timestamptz,
         $14,$15,$16,$17
       )`,
      params,
    );
  } else {
    await client.query(
      `UPDATE documents SET
         type = $2::document_type, status = 'published', title = $3, slug = $4,
         path = $5, legacy_path = $5, legacy_source_file = $6,
         excerpt = $7, body_json = $8::jsonb, type_data_json = $9::jsonb,
         author_id = $10, category_id = $11, published_at = COALESCE(published_at, $12::timestamptz),
         reviewed_at = $13::timestamptz, indexable = $14, unique_text_word_count = $15,
         title_normalized = $16, body_normalized = $17, imported_at = now(), deleted_at = NULL
       WHERE id = $1`,
      params,
    );
  }

  const seoTitle = input.title;
  const canonical = selfCanonical(input.path, SITE);
  await client.query(
    `INSERT INTO document_seo (
       document_id, seo_title, meta_description, canonical_url, robots, og_title, og_description, h1_override, schema_type
     ) VALUES ($1,$2,$3,$4,'index_follow',$2,$3,$5,$6)
     ON CONFLICT (document_id) DO UPDATE SET
       seo_title = EXCLUDED.seo_title,
       meta_description = EXCLUDED.meta_description,
       canonical_url = EXCLUDED.canonical_url,
       og_title = EXCLUDED.og_title,
       og_description = EXCLUDED.og_description,
       h1_override = EXCLUDED.h1_override`,
    [id, seoTitle, input.excerpt, canonical, input.h1, schemaType(input.type)],
  );

  let revised = false;
  const prev = existing ? JSON.stringify(existing.body_json) : '';
  if (!existing || prev !== body) {
    const ver = await one<{ v: number }>(client, 'SELECT COALESCE(MAX(version),0) AS v FROM document_revisions WHERE document_id = $1', [
      id,
    ]);
    const version = (ver?.v ?? 0) + 1;
    const revId = newId();
    await client.query(
      `INSERT INTO document_revisions (id, document_id, version, title, excerpt, body_json, type_data_json, seo_json)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8::jsonb)`,
      [
        revId,
        id,
        version,
        input.h1,
        input.excerpt,
        body,
        typeData,
        JSON.stringify({ seo_title: seoTitle, canonical }),
      ],
    );
    await client.query('UPDATE documents SET published_revision_id = $1 WHERE id = $2', [revId, id]);
    revised = true;
  }

  await client.query(
    `INSERT INTO content_metrics (document_id) VALUES ($1) ON CONFLICT (document_id) DO NOTHING`,
    [id],
  );

  if (input.keywords) {
    const keywordText = Array.isArray(input.keywords) ? input.keywords.join(',') : String(input.keywords);
    for (const raw of keywordText.split(/[،,]/)) {
      const name = raw.trim();
      if (!name) continue;
      const slug = name.replace(/\s+/g, '-').slice(0, 80);
      let tag = await one<{ id: string }>(client, 'SELECT id FROM tags WHERE slug = $1', [slug]);
      if (!tag) {
        const tid = newId();
        await client.query('INSERT INTO tags (id, slug, name) VALUES ($1,$2,$3) ON CONFLICT (slug) DO NOTHING', [
          tid,
          slug,
          name,
        ]);
        tag = await one<{ id: string }>(client, 'SELECT id FROM tags WHERE slug = $1', [slug]);
      }
      if (tag) {
        await client.query(
          'INSERT INTO document_tags (document_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
          [id, tag.id],
        );
      }
    }
  }

  return { id, created: !existing, revised };
}

function schemaType(type: DocumentType): string {
  if (type === 'article' || type === 'guide') return 'Article';
  if (type === 'tool_page' || type === 'calendar_content') return 'WebApplication';
  if (type === 'faq_page') return 'FAQPage';
  return 'WebPage';
}

async function upsertRoute(
  client: SqlClient,
  path: string,
  handler: HandlerKind,
  documentId: string,
  toolId: string | null,
  kind: string,
): Promise<void> {
  const existing = await one<{ id: string }>(client, 'SELECT id FROM routes WHERE path = $1', [path]);
  const id = existing?.id ?? newId();
  const canonical = selfCanonical(path, SITE);
  const resourceType = handler === 'tool' || handler === 'countdown' || handler === 'prices' ? 'tool' : 'document';
  await client.query(
    `INSERT INTO routes (id, path, handler_kind, resource_type, resource_id, document_id, tool_id, http_status, is_legacy, canonical_url, status)
     VALUES ($1,$2,$3::handler_kind,$4,$5,$6,$7,200,true,$8,'active')
     ON CONFLICT (path) DO UPDATE SET
       handler_kind = EXCLUDED.handler_kind,
       resource_type = EXCLUDED.resource_type,
       resource_id = EXCLUDED.resource_id,
       document_id = EXCLUDED.document_id,
       tool_id = EXCLUDED.tool_id,
       canonical_url = EXCLUDED.canonical_url,
       status = 'active'`,
    [id, path, handler, resourceType, documentId, documentId, toolId, canonical],
  );
  void kind;
}

async function upsertFaq(client: SqlClient, documentId: string, faq: { q: string; a: string }[]): Promise<number> {
  if (!faq.length) return 0;
  await client.query('DELETE FROM faq_items WHERE document_id = $1', [documentId]);
  let n = 0;
  for (const [i, item] of faq.entries()) {
    await client.query(
      'INSERT INTO faq_items (id, document_id, question, answer, sort_order) VALUES ($1,$2,$3,$4,$5)',
      [newId(), documentId, item.q, item.a, i],
    );
    n += 1;
  }
  return n;
}

async function upsertSources(
  client: SqlClient,
  documentId: string,
  sources: { label: string; url: string }[],
  accessed?: string,
): Promise<number> {
  if (!sources.length) return 0;
  await client.query('DELETE FROM document_sources WHERE document_id = $1', [documentId]);
  let n = 0;
  for (const [i, s] of sources.entries()) {
    let src = await one<{ id: string }>(
      client,
      `SELECT id FROM sources WHERE name = $1 AND coalesce(url, '') = $2`,
      [s.label, s.url || ''],
    );
    if (!src) {
      const sid = newId();
      await client.query(
        'INSERT INTO sources (id, name, url, source_type) VALUES ($1,$2,$3,$4)',
        [sid, s.label, s.url, 'web'],
      );
      src = { id: sid };
    }
    await client.query(
      `INSERT INTO document_sources (id, document_id, source_id, accessed_at, sort_order)
       VALUES ($1,$2,$3,$4::date,$5) ON CONFLICT (document_id, source_id) DO NOTHING`,
      [newId(), documentId, src.id, accessed ?? null, i],
    );
    n += 1;
  }
  return n;
}

function articleBlocks(a: Article): BodyBlock[] {
  const blocks: BodyBlock[] = [{ type: 'p', text: a.description }];
  for (const s of a.sections) {
    blocks.push({ type: 'h2', text: s.heading }, { type: 'p', text: s.body });
  }
  return blocks;
}

function guideBlocks(path: string, core: Record<string, { heading: string; paragraphs: string[]; bullets?: string[] }[]>): BodyBlock[] {
  const sections = core[path] || [];
  const blocks: BodyBlock[] = [];
  for (const s of sections) {
    blocks.push({ type: 'h2', text: s.heading });
    for (const p of s.paragraphs) blocks.push({ type: 'p', text: p });
    if (s.bullets?.length) blocks.push({ type: 'ul', items: s.bullets });
  }
  return blocks;
}

function topicBlocks(t: Topic): BodyBlock[] {
  const blocks: BodyBlock[] = t.intro.map((p) => ({ type: 'p' as const, text: p }));
  for (const s of t.sections) {
    blocks.push({ type: 'h2', text: s.heading });
    for (const p of s.paragraphs) blocks.push({ type: 'p', text: p });
  }
  return blocks;
}

export function loadLegacyPayload(root: string) {
  const dataDir = join(root, 'apps/web-legacy/src/data');
  const published = readJson<{ published: PublishedRow[] }>(join(root, 'apps/web-legacy/public/published.json'));
  const articles = readJson<{ articles: Article[] }>(join(dataDir, 'articles.json')).articles;
  const countdowns = readJson<{ countdowns: CountdownDef[] }>(join(dataDir, 'countdowns.json')).countdowns;
  const trending = readJson<{
    topics: Topic[];
    categories: Record<string, { ar: string; emoji: string }>;
  }>(join(dataDir, 'trending.json'));
  const prices = readJson<{ updated: string; xauUsd: number; source?: string; rates: Record<string, number> }>(
    join(dataDir, 'prices.json'),
  );
  const countries = readJson<{ countries: Country[] }>(join(dataDir, 'countries.json')).countries;
  const coreGuides = readJson<Record<string, { heading: string; paragraphs: string[]; bullets?: string[] }[]>>(
    join(dataDir, 'core-guides.json'),
  );
  return { published: published.published, articles, countdowns, trending, prices, countries, coreGuides };
}

export async function importLegacyContent(client: SqlClient, root: string): Promise<{ counts: ImportCounts; snapshot: ContentSnapshot }> {
  const payload = loadLegacyPayload(root);
  const articleBy = Object.fromEntries(payload.articles.map((a) => [a.slug, a]));
  const countdownBy = Object.fromEntries(payload.countdowns.map((c) => [c.slug, c]));
  const topicBy = Object.fromEntries(payload.trending.topics.map((t) => [t.slug, t]));
  const arCountries = payload.countries.filter((c) => (c.langs || []).includes('ar'));

  const counts: ImportCounts = {
    documents: 0,
    routes: 0,
    tools: 0,
    faq: 0,
    sources: 0,
    revisions: 0,
    countdowns: 0,
    priceSnapshots: 0,
    calendarEvents: 0,
    tags: 0,
  };

  const toolIdByKey = new Map<string, string>();
  const toolCat = {
    calendar: IDS.toolCatCalendar,
    market: IDS.toolCatMarket,
    text: IDS.toolCatText,
  };

  for (const def of LEGACY_TOOLS) {
    const existing = await one<{ id: string }>(client, 'SELECT id FROM tools WHERE key = $1', [def.key]);
    const id = existing?.id ?? newId();
    const cat =
      def.key.includes('gold') || def.key.includes('usd')
        ? toolCat.market
        : def.key.includes('name')
          ? toolCat.text
          : toolCat.calendar;
    await client.query(
      `INSERT INTO tools (id, key, path, name, description, engine_key, runtime, data_mode, category_id, status, visibility)
       VALUES ($1,$2,$3,$4,$5,$6,$7::tool_runtime,$8::tool_data_mode,$9,$10,'public')
       ON CONFLICT (key) DO UPDATE SET path = EXCLUDED.path, engine_key = EXCLUDED.engine_key, runtime = EXCLUDED.runtime, data_mode = EXCLUDED.data_mode`,
      [
        id,
        def.key,
        def.path,
        def.key,
        def.engineKey,
        def.engineKey,
        def.runtime,
        def.dataMode,
        cat,
        def.key === 'name-decoration' ? 'hidden' : 'active',
      ],
    );
    toolIdByKey.set(def.key, id);
    await client.query('INSERT INTO tool_metrics (tool_id) VALUES ($1) ON CONFLICT (tool_id) DO NOTHING', [id]);
    counts.tools += 1;
  }

  const snapshotRoutes: SnapshotRoute[] = [];
  const docIdByPath = new Map<string, string>();
  const relatedQueue: { from: string; slugs: string[]; prefix: string }[] = [];

  for (const row of payload.published) {
    const { type, handler } = classify(row.path, row.kind);
    let blocks: BodyBlock[] = [];
    let excerpt = row.title;
    let h1 = row.title.split('|')[0].trim();
    let faq: { q: string; a: string }[] = [];
    let sources: { label: string; url: string }[] = [];
    let keywords: string | undefined;
    let sourceFile = 'published.json';
    let reviewedAt: string | undefined;
    let articleCategory: string | undefined;
    let typeData: Record<string, unknown> = { publishedKind: row.kind };

    const articleSlug = row.path.startsWith('/articles/') && row.path !== '/articles' ? row.path.slice('/articles/'.length) : null;
    if (articleSlug && articleBy[articleSlug]) {
      const a = articleBy[articleSlug];
      blocks = articleBlocks(a);
      excerpt = a.description;
      h1 = a.title;
      faq = a.faq || [];
      sources = a.sources || [];
      keywords = a.keywords;
      sourceFile = 'articles.json';
      reviewedAt = a.reviewedAt || a.updatedAt;
      articleCategory = a.category;
      typeData = { ...typeData, read_minutes: undefined, category: a.category };
    } else if (row.path.startsWith('/countdown/') && countdownBy[row.path.slice('/countdown/'.length)]) {
      const def = countdownBy[row.path.slice('/countdown/'.length)];
      blocks = [{ type: 'p', text: def.summary }, ...def.paragraphs.map((p) => ({ type: 'p' as const, text: p }))];
      if (def.notes.length) blocks.push({ type: 'ul', items: def.notes });
      excerpt = def.summary;
      h1 = `${def.emoji ?? ''} ${def.question}`.trim();
      faq = def.faq || [];
      keywords = def.keywords;
      sourceFile = 'countdowns.json';
      typeData = { schedule: def.schedule, countdownSlug: def.slug };
      relatedQueue.push({ from: row.path, slugs: def.related || [], prefix: '/countdown/' });
    } else if (row.path.startsWith('/trending/') && topicBy[row.path.slice('/trending/'.length)]) {
      const t = topicBy[row.path.slice('/trending/'.length)];
      blocks = topicBlocks(t);
      excerpt = t.description;
      h1 = t.title;
      faq = t.faq || [];
      keywords = t.keywords;
      sourceFile = 'trending.json';
      relatedQueue.push({ from: row.path, slugs: t.related || [], prefix: '/trending/' });
    } else {
      blocks = guideBlocks(row.path, payload.coreGuides);
      if (!blocks.length) blocks = [{ type: 'p', text: excerpt }];
      sourceFile = payload.coreGuides[row.path] ? 'core-guides.json' : 'published.json';
    }

    if (row.path.startsWith('/gold-price/')) {
      const c = arCountries.find((x) => x.slug === row.path.slice('/gold-price/'.length));
      if (c) {
        h1 = `سعر الذهب في ${c.ar || c.en}`;
        excerpt = `سعر الذهب التقريبي في ${c.ar || c.en}`;
        typeData = { country: c.slug, currency: c.cur };
        sourceFile = 'prices.json';
      }
    }
    if (row.path.startsWith('/usd-rate/')) {
      const c = arCountries.find((x) => x.slug === row.path.slice('/usd-rate/'.length));
      if (c) {
        h1 = `سعر الدولار في ${c.ar || c.en}`;
        excerpt = `سعر الدولار التقريبي في ${c.ar || c.en}`;
        typeData = { country: c.slug, currency: c.cur };
        sourceFile = 'prices.json';
      }
    }

    const doc = await upsertDocument(client, {
      path: row.path,
      type,
      title: row.title,
      h1,
      excerpt,
      blocks,
      sourceFile,
      categoryId: categoryIdFor(row.path, articleCategory),
      reviewedAt,
      keywords,
      typeData,
      indexable: true,
    });
    docIdByPath.set(row.path, doc.id);
    counts.documents += 1;
    if (doc.revised) counts.revisions += 1;
    counts.faq += await upsertFaq(client, doc.id, faq);
    counts.sources += await upsertSources(client, doc.id, sources, reviewedAt);

    let toolId: string | null = null;
    if (handler === 'tool' || handler === 'prices' || handler === 'countdown') {
      if (row.path.startsWith('/gold-price')) toolId = toolIdByKey.get('gold-price') ?? null;
      else if (row.path.startsWith('/usd-rate')) toolId = toolIdByKey.get('usd-rate') ?? null;
      else if (row.path.startsWith('/countdown')) toolId = toolIdByKey.get('countdown') ?? null;
      else {
        const key = LEGACY_TOOLS.find((t) => t.path === row.path)?.key;
        toolId = key ? toolIdByKey.get(key) ?? null : null;
      }
    }
    await upsertRoute(client, row.path, handler, doc.id, toolId, row.kind);
    counts.routes += 1;

    if (toolId) {
      await client.query('UPDATE tools SET document_id = COALESCE(document_id, $1) WHERE id = $2', [doc.id, toolId]);
    }

    snapshotRoutes.push({
      path: row.path,
      slug: slugOf(row.path),
      title: row.title,
      h1,
      description: excerpt,
      robots: 'index, follow',
      canonicalUrl: selfCanonical(row.path, SITE),
      documentType: type,
      status: 'published',
      handlerKind: handler,
      indexable: true,
      kind: row.kind,
    });
  }

  for (const def of payload.countdowns) {
    const path = `/countdown/${def.slug}`;
    const documentId = docIdByPath.get(path);
    await client.query(
      `INSERT INTO countdown_definitions (
         id, slug, title, question, category, emoji, summary, keywords, schedule_json, notes_json, related_slugs_json, document_id
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10::jsonb,$11::jsonb,$12)
       ON CONFLICT (slug) DO UPDATE SET
         title = EXCLUDED.title, question = EXCLUDED.question, schedule_json = EXCLUDED.schedule_json, document_id = EXCLUDED.document_id`,
      [
        newId(),
        def.slug,
        def.title,
        def.question,
        def.category,
        def.emoji ?? null,
        def.summary,
        def.keywords ?? null,
        JSON.stringify(def.schedule),
        JSON.stringify(def.notes),
        JSON.stringify(def.related || []),
        documentId ?? null,
      ],
    );
    counts.countdowns += 1;
  }

  for (const rel of relatedQueue) {
    const fromId = docIdByPath.get(rel.from);
    if (!fromId) continue;
    let order = 0;
    for (const slug of rel.slugs) {
      const toId = docIdByPath.get(`${rel.prefix}${slug}`);
      if (!toId || toId === fromId) continue;
      await client.query(
        `INSERT INTO document_relations (from_id, to_id, kind, is_manual, sort_order)
         VALUES ($1,$2,'related',true,$3) ON CONFLICT DO NOTHING`,
        [fromId, toId, order],
      );
      order += 1;
    }
  }

  const captured = payload.prices.updated ? `${payload.prices.updated}T00:00:00Z` : '2026-08-20T00:00:00Z';
  const source = payload.prices.source || 'legacy-prices.json';
  async function addPrice(asset: string, quote: string, value: number, extras?: string) {
    const found = await one<{ id: string }>(
      client,
      `SELECT id FROM price_snapshots
       WHERE captured_at = $1::timestamptz AND asset = $2 AND quote_currency = $3 AND coalesce(source,'') = $4`,
      [captured, asset, quote, source],
    );
    if (found) return;
    await client.query(
      `INSERT INTO price_snapshots (id, captured_at, asset, quote_currency, value, source, extras_json)
       VALUES ($1,$2::timestamptz,$3,$4,$5,$6,$7::jsonb)`,
      [newId(), captured, asset, quote, value, source, extras ?? '{}'],
    );
    counts.priceSnapshots += 1;
  }
  await addPrice('XAU', 'USD', payload.prices.xauUsd, JSON.stringify({ rates: payload.prices.rates }));
  for (const [cur, value] of Object.entries(payload.prices.rates)) {
    await addPrice('USD', cur, value);
  }

  counts.calendarEvents += await importCalendarEvents(client);

  const tagCount = await one<{ n: number }>(client, 'SELECT count(*)::int AS n FROM tags', []);
  counts.tags = tagCount?.n ?? 0;

  const snapshot: ContentSnapshot = {
    generatedAt: new Date().toISOString(),
    siteUrl: SITE,
    routes: snapshotRoutes,
    counts: { ...counts, published: payload.published.length },
  };

  return { counts, snapshot };
}

async function importCalendarEvents(client: SqlClient): Promise<number> {
  const hijri: { key: string; title: string; y: number; m: number; d: number; category: string; holiday: boolean; days?: number; description: string }[] = [
    { key: 'hijri-new-year-1448', title: 'رأس السنة الهجرية 1448هـ', y: 1448, m: 1, d: 1, category: 'religious', holiday: false, description: 'بداية العام الهجري 1448هـ وفق أم القرى.' },
    { key: 'ramadan-start-1448', title: 'مطلع رمضان 1448هـ', y: 1448, m: 9, d: 1, category: 'religious', holiday: false, description: 'بداية رمضان 1448هـ.' },
    { key: 'eid-fitr-1448', title: 'عيد الفطر 1448هـ', y: 1448, m: 10, d: 1, category: 'religious', holiday: true, days: 4, description: '1 شوال 1448هـ.' },
    { key: 'arafat-1448', title: 'وقفة عرفة 1448هـ', y: 1448, m: 12, d: 9, category: 'religious', holiday: false, description: '9 ذو الحجة 1448هـ.' },
    { key: 'eid-adha-1448', title: 'عيد الأضحى 1448هـ', y: 1448, m: 12, d: 10, category: 'religious', holiday: true, days: 4, description: '10 ذو الحجة 1448هـ.' },
    { key: 'hijri-new-year-1449', title: 'رأس السنة الهجرية 1449هـ', y: 1449, m: 1, d: 1, category: 'religious', holiday: false, description: 'بداية 1449هـ وفق أم القرى.' },
  ];
  const greg: { key: string; title: string; date: string; category: string; holiday: boolean; days?: number; description: string }[] = [
    { key: 'school-return-1448', title: 'عودة المعلمين والمعلمات', date: '2026-08-16', category: 'school', holiday: false, description: 'عودة المعلمين 1448-1449هـ.' },
    { key: 'school-start-1448', title: 'بداية العام الدراسي 1448-1449هـ', date: '2026-08-23', category: 'school', holiday: false, description: 'بداية الدراسة بنظام الفصلين.' },
    { key: 'national-day-2026', title: 'اليوم الوطني السعودي', date: '2026-09-23', category: 'national', holiday: true, days: 1, description: '23 سبتمبر.' },
    { key: 'fall-break-1448', title: 'إجازة الخريف', date: '2026-11-20', category: 'school', holiday: true, days: 9, description: 'إجازة الخريف 1448-1449هـ.' },
    { key: 'founders-day-1448', title: 'يوم التأسيس السعودي', date: '2027-02-22', category: 'national', holiday: true, days: 1, description: '22 فبراير.' },
    { key: 'midyear-break-1448', title: 'إجازة منتصف العام الدراسي', date: '2027-01-08', category: 'school', holiday: true, days: 9, description: 'بين الفصلين.' },
    { key: 'flag-day-1448', title: 'يوم العلم السعودي', date: '2027-03-11', category: 'national', holiday: false, description: '11 مارس.' },
    { key: 'school-end-1448', title: 'نهاية العام الدراسي 1448-1449هـ', date: '2027-06-24', category: 'school', holiday: true, days: 75, description: 'نهاية الإطار العام للعام الدراسي.' },
  ];
  let n = 0;
  for (const e of hijri) {
    const g = hijriToGregorian({ year: e.y, month: e.m, day: e.d });
    const iso = `${g.year}-${String(g.month).padStart(2, '0')}-${String(g.day).padStart(2, '0')}`;
    await client.query(
      `INSERT INTO calendar_events (id, key, title, category, gregorian_date, hijri_rule_json, is_holiday, holiday_days, description)
       VALUES ($1,$2,$3,$4,$5::date,$6::jsonb,$7,$8,$9)
       ON CONFLICT (key) DO UPDATE SET gregorian_date = EXCLUDED.gregorian_date, title = EXCLUDED.title`,
      [newId(), e.key, e.title, e.category, iso, JSON.stringify({ year: e.y, month: e.m, day: e.d }), e.holiday, e.days ?? null, e.description],
    );
    n += 1;
  }
  for (const e of greg) {
    await client.query(
      `INSERT INTO calendar_events (id, key, title, category, gregorian_date, is_holiday, holiday_days, description)
       VALUES ($1,$2,$3,$4,$5::date,$6,$7,$8)
       ON CONFLICT (key) DO UPDATE SET gregorian_date = EXCLUDED.gregorian_date, title = EXCLUDED.title`,
      [newId(), e.key, e.title, e.category, e.date, e.holiday, e.days ?? null, e.description],
    );
    n += 1;
  }
  return n;
}

export async function collectParity(client: SqlClient, root: string) {
  const published = loadLegacyPayload(root).published;
  const routes = await client.query<{ path: string; canonical_url: string | null }>(
    'SELECT path, canonical_url FROM routes ORDER BY path',
  );
  const docs = await client.query<{ path: string; title: string; status: string; type: string }>(
    'SELECT path, title, status::text, type::text FROM documents WHERE deleted_at IS NULL',
  );
  const seo = await client.query<{ canonical_url: string; seo_title: string | null; document_id: string }>(
    'SELECT canonical_url, seo_title, document_id FROM document_seo',
  );
  const seoByDoc = Object.fromEntries(seo.rows.map((s) => [s.document_id, s]));
  const docsWithId = await client.query<{ id: string; path: string; title: string }>(
    'SELECT id, path, title FROM documents WHERE deleted_at IS NULL',
  );
  const byPath = Object.fromEntries(docsWithId.rows.map((d) => [d.path, { ...d, seo: seoByDoc[d.id] }]));
  const missing: string[] = [];
  const mismatches: string[] = [];
  for (const row of published) {
    if (!byPath[row.path]) {
      missing.push(row.path);
      continue;
    }
    const rec = byPath[row.path];
    const title = rec.seo?.seo_title || rec.title;
    if (title !== row.title) mismatches.push(`${row.path} title`);
    const canonical = rec.seo?.canonical_url;
    if (canonical !== `${SITE}${row.path === '/' ? '/' : row.path}`) mismatches.push(`${row.path} canonical`);
  }
  const extra = routes.rows.filter((r) => !published.some((p) => p.path === r.path)).map((r) => r.path);
  return {
    published: published.length,
    documents: docs.rows.length,
    routes: routes.rows.length,
    missing,
    mismatches,
    extra,
  };
}
