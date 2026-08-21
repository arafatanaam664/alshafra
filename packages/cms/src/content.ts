import { newId } from '@alshafra/kernel';
import { selfCanonical } from '@alshafra/seo';
import type { DocumentStatus, DocumentType } from '@alshafra/content';
import type { SqlClient } from '@alshafra/database';
import { writeAudit } from './audit';
import { type Actor, hasPermission, requirePermission } from './permissions';
import { sanitizeBlocks, type BodyBlock } from './sanitize';
import { defaultPathForType, isHighPath, normalizeSlug, slugFromPath, validatePath } from './slug';
import { assertTransition } from './workflow';

const SITE = 'https://alshafra.com';

async function one<T>(db: SqlClient, sql: string, params: unknown[] = []): Promise<T | undefined> {
  const r = await db.query<T>(sql, params);
  return r.rows[0];
}

export async function listDocuments(
  db: SqlClient,
  actor: Actor | null,
  filter: { status?: string; type?: string; q?: string; limit?: number } = {},
) {
  requirePermission(actor, 'documents.read');
  const limit = Math.min(filter.limit ?? 100, 200);
  const r = await db.query(
    `SELECT d.id, d.type::text, d.status::text, d.title, d.slug, d.path, d.excerpt, d.indexable,
            d.published_at, d.updated_at, d.author_id, d.category_id,
            s.seo_title, s.meta_description, s.canonical_url, s.robots::text
     FROM documents d
     LEFT JOIN document_seo s ON s.document_id = d.id
     WHERE d.deleted_at IS NULL
       AND ($1::text IS NULL OR d.status::text = $1)
       AND ($2::text IS NULL OR d.type::text = $2)
       AND ($3::text IS NULL OR d.title ILIKE '%' || $3 || '%' OR d.path ILIKE '%' || $3 || '%')
     ORDER BY d.updated_at DESC
     LIMIT $4`,
    [filter.status ?? null, filter.type ?? null, filter.q ?? null, limit],
  );
  return r.rows;
}

export async function getDocument(db: SqlClient, actor: Actor | null, id: string) {
  requirePermission(actor, 'documents.read');
  const doc = await one<Record<string, unknown>>(
    db,
    `SELECT d.*, s.seo_title, s.meta_description, s.canonical_url, s.robots::text AS robots,
            s.og_title, s.og_description, s.h1_override, s.schema_type
     FROM documents d
     LEFT JOIN document_seo s ON s.document_id = d.id
     WHERE d.id = $1 AND d.deleted_at IS NULL`,
    [id],
  );
  if (!doc) return null;
  const faq = await db.query(`SELECT id, question, answer, sort_order FROM faq_items WHERE document_id = $1 ORDER BY sort_order`, [id]);
  const tags = await db.query(
    `SELECT t.id, t.slug, t.name FROM tags t JOIN document_tags dt ON dt.tag_id = t.id WHERE dt.document_id = $1`,
    [id],
  );
  const topics = await db.query(
    `SELECT t.id, t.key, t.name FROM topics t JOIN document_topics dt ON dt.topic_id = t.id WHERE dt.document_id = $1`,
    [id],
  );
  const entities = await db.query(
    `SELECT e.id, e.key, e.name FROM entities e JOIN document_entities de ON de.entity_id = e.id WHERE de.document_id = $1`,
    [id],
  );
  const sources = await db.query(
    `SELECT s.id, s.name, s.url, ds.accessed_at, ds.notes
     FROM document_sources ds JOIN sources s ON s.id = ds.source_id WHERE ds.document_id = $1 ORDER BY ds.sort_order`,
    [id],
  );
  const relations = await db.query(
    `SELECT to_id, kind::text, is_manual FROM document_relations WHERE from_id = $1`,
    [id],
  );
  const revisions = await db.query(
    `SELECT id, version, title, created_at FROM document_revisions WHERE document_id = $1 ORDER BY version DESC LIMIT 50`,
    [id],
  );
  return { document: doc, faq: faq.rows, tags: tags.rows, topics: topics.rows, entities: entities.rows, sources: sources.rows, relations: relations.rows, revisions: revisions.rows };
}

export interface CreateDocumentInput {
  type: DocumentType;
  title: string;
  slug?: string;
  path?: string;
  excerpt?: string;
  body?: BodyBlock[];
  categoryId?: string | null;
  authorId?: string | null;
}

export async function createDocument(db: SqlClient, actor: Actor, input: CreateDocumentInput) {
  requirePermission(actor, 'documents.create');
  const slug = normalizeSlug(input.slug || input.title);
  const path = input.path || defaultPathForType(input.type, slug);
  const valid = validatePath(path);
  if (!valid.ok) throw new Error(valid.error);
  const clash = await one<{ id: string }>(db, 'SELECT id FROM documents WHERE path = $1 AND deleted_at IS NULL', [path]);
  if (clash) throw new Error('path_collision');
  const routeClash = await one<{ id: string }>(db, 'SELECT id FROM routes WHERE path = $1', [path]);
  if (routeClash) throw new Error('route_collision');
  const toolClash = await one<{ id: string }>(db, 'SELECT id FROM tools WHERE path = $1', [path]);
  if (toolClash) throw new Error('tool_collision');

  const id = newId();
  const blocks = sanitizeBlocks(input.body ?? [{ type: 'p', text: input.excerpt || '' }]);
  await db.query(
    `INSERT INTO documents (
       id, type, status, locale, title, slug, path, excerpt, body_json, type_data_json,
       author_id, category_id, indexable, unique_text_word_count
     ) VALUES (
       $1,$2::document_type,'draft','ar',$3,$4,$5,$6,$7::jsonb,'{}'::jsonb,
       $8,$9,false,0
     )`,
    [id, input.type, input.title, slugFromPath(path), path, input.excerpt ?? '', JSON.stringify(blocks), input.authorId ?? null, input.categoryId ?? null],
  );
  const canonical = selfCanonical(path, SITE);
  await db.query(
    `INSERT INTO document_seo (document_id, seo_title, meta_description, canonical_url, robots, h1_override, schema_type)
     VALUES ($1,$2,$3,$4,'noindex_follow',$2,'WebPage')`,
    [id, input.title, input.excerpt ?? '', canonical],
  );
  await insertRevision(db, id, 1, input.title, input.excerpt ?? '', blocks, { seo_title: input.title }, actor);
  await writeAudit(db, actor, 'documents.create', 'document', id, null, { path, title: input.title });
  return { id, path, status: 'draft' as const };
}

export interface UpdateDocumentInput {
  title?: string;
  excerpt?: string;
  body?: BodyBlock[];
  categoryId?: string | null;
  seoTitle?: string | null;
  metaDescription?: string | null;
  robots?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  h1Override?: string | null;
  path?: string;
  createRedirect?: boolean;
  autosave?: boolean;
  indexable?: boolean;
}

export async function updateDocument(db: SqlClient, actor: Actor, id: string, input: UpdateDocumentInput) {
  const current = await one<{
    path: string;
    title: string;
    status: string;
    excerpt: string | null;
    body_json: unknown;
  }>(db, 'SELECT path, title, status::text AS status, excerpt, body_json FROM documents WHERE id = $1 AND deleted_at IS NULL', [id]);
  if (!current) throw new Error('not_found');

  const isSeoOnly =
    input.seoTitle !== undefined ||
    input.metaDescription !== undefined ||
    input.robots !== undefined ||
    input.ogTitle !== undefined ||
    input.h1Override !== undefined;
  const isBody = input.title !== undefined || input.excerpt !== undefined || input.body !== undefined;

  if (isBody) requirePermission(actor, current.status === 'published' ? 'documents.update' : 'documents.create');
  if (isSeoOnly && current.status === 'published') requirePermission(actor, 'documents.seo_edit');
  if (!isBody && !isSeoOnly && !input.path && input.categoryId === undefined && input.indexable === undefined) {
    requirePermission(actor, 'documents.update');
  }

  let path = current.path;
  if (input.path && input.path !== current.path) {
    if (isHighPath(current.path) && !hasPermission(actor, 'seo.edit_high_intent')) {
      throw new Error('high_path_locked');
    }
    const valid = validatePath(input.path);
    if (!valid.ok) throw new Error(valid.error);
    const clash = await one<{ id: string }>(db, 'SELECT id FROM documents WHERE path = $1 AND deleted_at IS NULL AND id <> $2', [
      input.path,
      id,
    ]);
    if (clash) throw new Error('path_collision');
    if (input.createRedirect) {
      await db.query(
        `INSERT INTO redirects (id, source_pattern, destination, status_code, reason, is_enabled)
         VALUES ($1,$2,$3,301,'slug change',true)
         ON CONFLICT (source_pattern) DO UPDATE SET destination = EXCLUDED.destination, status_code = 301`,
        [newId(), current.path, input.path],
      );
    } else if (current.status === 'published') {
      throw new Error('redirect_required');
    }
    path = input.path;
    await db.query(`UPDATE routes SET path = $1, canonical_url = $2 WHERE document_id = $3`, [
      path,
      selfCanonical(path, SITE),
      id,
    ]);
  }

  const title = input.title ?? current.title;
  const excerpt = input.excerpt ?? current.excerpt ?? '';
  const body = input.body ? sanitizeBlocks(input.body) : null;

  await db.query(
    `UPDATE documents SET
       title = $2, excerpt = $3, path = $4, slug = $5,
       body_json = COALESCE($6::jsonb, body_json),
       category_id = COALESCE($7, category_id),
       indexable = COALESCE($8, indexable)
     WHERE id = $1`,
    [
      id,
      title,
      excerpt,
      path,
      slugFromPath(path),
      body ? JSON.stringify(body) : null,
      input.categoryId ?? null,
      input.indexable ?? null,
    ],
  );

  await db.query(
    `UPDATE document_seo SET
       seo_title = COALESCE($2, seo_title),
       meta_description = COALESCE($3, meta_description),
       canonical_url = $4,
       robots = COALESCE($5::robots_directive, robots),
       og_title = COALESCE($6, og_title),
       og_description = COALESCE($7, og_description),
       h1_override = COALESCE($8, h1_override)
     WHERE document_id = $1`,
    [
      id,
      input.seoTitle ?? null,
      input.metaDescription ?? null,
      selfCanonical(path, SITE),
      input.robots ?? null,
      input.ogTitle ?? null,
      input.ogDescription ?? null,
      input.h1Override ?? null,
    ],
  );

  if (!input.autosave && (isBody || input.path)) {
    const ver = await one<{ v: number }>(db, 'SELECT COALESCE(MAX(version),0)::int AS v FROM document_revisions WHERE document_id = $1', [id]);
    await insertRevision(db, id, (ver?.v ?? 0) + 1, title, excerpt, body ?? sanitizeBlocks(current.body_json), { path }, actor);
  }

  await writeAudit(db, actor, input.autosave ? 'documents.autosave' : 'documents.update', 'document', id, { path: current.path }, { path });
  return { id, path };
}

async function insertRevision(
  db: SqlClient,
  documentId: string,
  version: number,
  title: string,
  excerpt: string,
  body: BodyBlock[],
  seo: unknown,
  actor: Actor | null,
) {
  const revId = newId();
  await db.query(
    `INSERT INTO document_revisions (id, document_id, version, author_user_id, title, excerpt, body_json, type_data_json, seo_json)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,'{}'::jsonb,$8::jsonb)`,
    [revId, documentId, version, actor?.userId ?? null, title, excerpt, JSON.stringify(body), JSON.stringify(seo)],
  );
  return revId;
}

export async function transitionDocument(db: SqlClient, actor: Actor, id: string, to: DocumentStatus, scheduledAt?: string) {
  const current = await one<{ status: string; path: string; title: string; excerpt: string | null; body_json: unknown }>(
    db,
    `SELECT status::text AS status, path, title, excerpt, body_json FROM documents WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  if (!current) throw new Error('not_found');
  const from = current.status as DocumentStatus;
  assertTransition(actor, from, to);

  const now = new Date().toISOString();
  let indexable = false;
  let publishedAt: string | null = null;
  if (to === 'published') {
    requirePermission(actor, 'documents.publish');
    indexable = true;
    publishedAt = now;
    const ver = await one<{ v: number }>(db, 'SELECT COALESCE(MAX(version),0)::int AS v FROM document_revisions WHERE document_id = $1', [id]);
    const revId = await insertRevision(
      db,
      id,
      (ver?.v ?? 0) + 1,
      current.title,
      current.excerpt ?? '',
      sanitizeBlocks(current.body_json),
      { event: 'publish' },
      actor,
    );
    await db.query(`UPDATE documents SET published_revision_id = $1 WHERE id = $2`, [revId, id]);
    const existingRoute = await one<{ id: string }>(db, 'SELECT id FROM routes WHERE path = $1', [current.path]);
    if (!existingRoute) {
      await db.query(
        `INSERT INTO routes (id, path, handler_kind, resource_type, resource_id, document_id, http_status, is_legacy, canonical_url, status)
         VALUES ($1,$2,'document','document',$3,$3,200,false,$4,'active')`,
        [newId(), current.path, id, selfCanonical(current.path, SITE)],
      );
    }
    await db.query(
      `UPDATE document_seo SET robots = 'index_follow', canonical_url = $2 WHERE document_id = $1`,
      [id, selfCanonical(current.path, SITE)],
    );
  }
  if (to === 'unpublished' || to === 'archived') {
    indexable = false;
    await db.query(`UPDATE document_seo SET robots = 'noindex_follow' WHERE document_id = $1`, [id]);
  }

  await db.query(
    `UPDATE documents SET status = $2::document_status, indexable = $3,
       published_at = COALESCE($4::timestamptz, published_at),
       scheduled_at = $5::timestamptz,
       unpublished_at = CASE WHEN $2 = 'unpublished' THEN now() ELSE unpublished_at END
     WHERE id = $1`,
    [id, to, indexable, publishedAt, to === 'scheduled' ? scheduledAt ?? now : null],
  );
  await writeAudit(db, actor, `documents.${to}`, 'document', id, { status: from }, { status: to });
  return { id, from, to, path: current.path };
}

export async function restoreRevision(db: SqlClient, actor: Actor, documentId: string, version: number) {
  requirePermission(actor, 'documents.restore');
  const rev = await one<{ title: string; excerpt: string | null; body_json: unknown; version: number }>(
    db,
    `SELECT title, excerpt, body_json, version FROM document_revisions WHERE document_id = $1 AND version = $2`,
    [documentId, version],
  );
  if (!rev) throw new Error('not_found');
  await db.query(`UPDATE documents SET title = $2, excerpt = $3, body_json = $4::jsonb WHERE id = $1`, [
    documentId,
    rev.title,
    rev.excerpt ?? '',
    JSON.stringify(rev.body_json),
  ]);
  const ver = await one<{ v: number }>(db, 'SELECT COALESCE(MAX(version),0)::int AS v FROM document_revisions WHERE document_id = $1', [
    documentId,
  ]);
  await db.query(
    `INSERT INTO document_revisions (id, document_id, version, title, excerpt, body_json, type_data_json, seo_json, restored_from_version)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb,'{}'::jsonb,'{}'::jsonb,$7)`,
    [newId(), documentId, (ver?.v ?? 0) + 1, rev.title, rev.excerpt ?? '', JSON.stringify(rev.body_json), version],
  );
  await writeAudit(db, actor, 'documents.restore', 'document', documentId, { version }, { restored_from: version });
  return { documentId, restoredFrom: version };
}

export async function replaceFaqs(db: SqlClient, actor: Actor, documentId: string, items: { q: string; a: string }[]) {
  requirePermission(actor, 'documents.update');
  await db.query('DELETE FROM faq_items WHERE document_id = $1', [documentId]);
  let i = 0;
  for (const item of items) {
    await db.query(
      `INSERT INTO faq_items (id, document_id, question, answer, sort_order) VALUES ($1,$2,$3,$4,$5)`,
      [newId(), documentId, item.q, item.a, i],
    );
    i += 1;
  }
  await writeAudit(db, actor, 'documents.faq', 'document', documentId, null, { count: items.length });
}

export async function addSource(
  db: SqlClient,
  actor: Actor,
  documentId: string,
  source: { name: string; url?: string; notes?: string },
) {
  requirePermission(actor, 'documents.update');
  let row = await one<{ id: string }>(db, `SELECT id FROM sources WHERE name = $1 AND coalesce(url,'') = $2`, [
    source.name,
    source.url || '',
  ]);
  if (!row) {
    const sid = newId();
    await db.query(`INSERT INTO sources (id, name, url, source_type) VALUES ($1,$2,$3,'web')`, [
      sid,
      source.name,
      source.url ?? null,
    ]);
    row = { id: sid };
  }
  await db.query(
    `INSERT INTO document_sources (id, document_id, source_id, notes) VALUES ($1,$2,$3,$4)
     ON CONFLICT (document_id, source_id) DO NOTHING`,
    [newId(), documentId, row.id, source.notes ?? null],
  );
}

export async function setTags(db: SqlClient, actor: Actor, documentId: string, slugs: string[]) {
  requirePermission(actor, 'documents.update');
  await db.query('DELETE FROM document_tags WHERE document_id = $1', [documentId]);
  for (const raw of slugs) {
    const slug = normalizeSlug(raw);
    if (!slug) continue;
    let tag = await one<{ id: string }>(db, 'SELECT id FROM tags WHERE slug = $1', [slug]);
    if (!tag) {
      const tid = newId();
      await db.query('INSERT INTO tags (id, slug, name) VALUES ($1,$2,$3) ON CONFLICT (slug) DO NOTHING', [tid, slug, raw]);
      tag = await one<{ id: string }>(db, 'SELECT id FROM tags WHERE slug = $1', [slug]);
    }
    if (tag) {
      await db.query('INSERT INTO document_tags (document_id, tag_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [
        documentId,
        tag.id,
      ]);
    }
  }
}

export async function addRelation(db: SqlClient, actor: Actor, fromId: string, toId: string, kind = 'related') {
  requirePermission(actor, 'documents.update');
  if (fromId === toId) throw new Error('self_relation');
  await db.query(
    `INSERT INTO document_relations (from_id, to_id, kind, is_manual, sort_order)
     VALUES ($1,$2,$3::relation_kind,true,0) ON CONFLICT DO NOTHING`,
    [fromId, toId, kind],
  );
}

export async function countPublishedRoutes(db: SqlClient): Promise<number> {
  const r = await one<{ n: number }>(db, `SELECT count(*)::int AS n FROM routes WHERE status = 'active'`);
  return r?.n ?? 0;
}
