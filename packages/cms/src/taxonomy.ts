import { newId } from '@alshafra/kernel';
import type { SqlClient } from '@alshafra/database';
import { writeAudit } from './audit';
import { requirePermission, type Actor } from './permissions';
import { normalizeSlug, validatePath } from './slug';

export async function listCategories(db: SqlClient) {
  const r = await db.query(
    `SELECT id, key, name, slug, path, description, parent_id, sort_order, status, is_published
     FROM categories WHERE deleted_at IS NULL ORDER BY sort_order, name`,
  );
  return r.rows;
}

export async function upsertCategory(
  db: SqlClient,
  actor: Actor,
  input: { id?: string; key: string; name: string; slug?: string; path?: string | null; description?: string; parentId?: string | null },
) {
  requirePermission(actor, input.id ? 'taxonomy.update' : 'taxonomy.create');
  const slug = normalizeSlug(input.slug || input.key);
  if (input.path) {
    const v = validatePath(input.path);
    if (!v.ok) throw new Error(v.error);
  }
  const id = input.id ?? newId();
  await db.query(
    `INSERT INTO categories (id, key, name, slug, path, description, parent_id, sort_order, status, is_published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,0,'active',true)
     ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, path = EXCLUDED.path, description = EXCLUDED.description`,
    [id, input.key, input.name, slug, input.path ?? null, input.description ?? null, input.parentId ?? null],
  );
  await writeAudit(db, actor, input.id ? 'taxonomy.category.update' : 'taxonomy.category.create', 'category', id);
  return { id };
}

export async function listTopics(db: SqlClient) {
  return (await db.query(`SELECT id, key, name FROM topics ORDER BY name`)).rows;
}

export async function upsertTopic(db: SqlClient, actor: Actor, input: { key: string; name: string }) {
  requirePermission(actor, 'taxonomy.create');
  const id = newId();
  await db.query(
    `INSERT INTO topics (id, key, name) VALUES ($1,$2,$3) ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name`,
    [id, input.key, input.name],
  );
  await writeAudit(db, actor, 'taxonomy.topic.upsert', 'topic', id);
  return { id };
}

export async function listTags(db: SqlClient) {
  return (await db.query(`SELECT id, slug, name FROM tags ORDER BY name LIMIT 500`)).rows;
}

export async function upsertTag(db: SqlClient, actor: Actor, input: { slug: string; name: string }) {
  requirePermission(actor, 'taxonomy.create');
  const slug = normalizeSlug(input.slug);
  const id = newId();
  await db.query(
    `INSERT INTO tags (id, slug, name) VALUES ($1,$2,$3) ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name`,
    [id, slug, input.name],
  );
  await writeAudit(db, actor, 'taxonomy.tag.upsert', 'tag', id);
  return { id };
}

export async function mergeTags(db: SqlClient, actor: Actor, fromId: string, toId: string) {
  requirePermission(actor, 'taxonomy.update');
  if (fromId === toId) throw new Error('same_tag');
  await db.query(
    `INSERT INTO document_tags (document_id, tag_id)
     SELECT document_id, $2 FROM document_tags WHERE tag_id = $1
     ON CONFLICT DO NOTHING`,
    [fromId, toId],
  );
  await db.query(`DELETE FROM document_tags WHERE tag_id = $1`, [fromId]);
  await db.query(`DELETE FROM tags WHERE id = $1`, [fromId]);
  await writeAudit(db, actor, 'taxonomy.tag.merge', 'tag', toId, { fromId }, { toId });
}

export async function listEntities(db: SqlClient) {
  return (await db.query(`SELECT id, key, name, kind::text, description FROM entities WHERE deleted_at IS NULL ORDER BY name`)).rows;
}

export async function upsertEntity(
  db: SqlClient,
  actor: Actor,
  input: { key: string; name: string; kind?: string; description?: string },
) {
  requirePermission(actor, 'taxonomy.create');
  const id = newId();
  await db.query(
    `INSERT INTO entities (id, key, name, kind, description)
     VALUES ($1,$2,$3,COALESCE($4::entity_kind,'other'),$5)
     ON CONFLICT (key) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
    [id, input.key, input.name, input.kind ?? 'other', input.description ?? null],
  );
  await writeAudit(db, actor, 'taxonomy.entity.upsert', 'entity', id);
  return { id };
}

export async function listAuthors(db: SqlClient) {
  return (await db.query(`SELECT id, name, slug, bio, expertise, is_organization FROM authors WHERE deleted_at IS NULL ORDER BY name`)).rows;
}

export async function upsertAuthor(
  db: SqlClient,
  actor: Actor,
  input: { name: string; slug: string; bio?: string; expertise?: string; isOrganization?: boolean },
) {
  requirePermission(actor, 'taxonomy.create');
  const id = newId();
  await db.query(
    `INSERT INTO authors (id, name, slug, bio, expertise, is_organization)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, bio = EXCLUDED.bio, expertise = EXCLUDED.expertise`,
    [id, input.name, normalizeSlug(input.slug), input.bio ?? null, input.expertise ?? null, input.isOrganization ?? false],
  );
  await writeAudit(db, actor, 'authors.upsert', 'author', id);
  return { id };
}
