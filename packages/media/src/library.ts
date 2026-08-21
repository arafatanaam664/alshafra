import type { SqlClient } from '@alshafra/database';
import { publicObjectUrl } from './public';
import type { StorageProvider } from './types';
import type { MediaRecord } from './types';

interface MediaRow {
  id: string;
  object_key: string;
  mime: string;
  byte_size: number | string;
  width: number | null;
  height: number | null;
  alt: string | null;
  caption: string | null;
  credit: string | null;
  sha256: string | null;
  visibility: string;
  created_at?: string;
}

function toRecord(row: MediaRow): MediaRecord {
  return {
    id: row.id,
    objectKey: row.object_key,
    mime: row.mime,
    byteSize: Number(row.byte_size),
    width: row.width,
    height: row.height,
    alt: row.alt,
    caption: row.caption,
    credit: row.credit,
    sha256: row.sha256,
    visibility: row.visibility === 'private' ? 'private' : 'public',
    publicUrl: publicObjectUrl(row.object_key),
    createdAt: row.created_at,
  };
}

export async function listMediaLibrary(db: SqlClient, limit = 200): Promise<MediaRecord[]> {
  const rows = await db.query<MediaRow>(
    `SELECT id, object_key, mime, byte_size, width, height, alt, caption, credit, sha256,
            visibility::text, created_at::text
     FROM media WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1`,
    [Math.min(limit, 200)],
  );
  return rows.rows.map(toRecord);
}

export async function getMedia(db: SqlClient, id: string): Promise<MediaRecord | null> {
  const rows = await db.query<MediaRow>(
    `SELECT id, object_key, mime, byte_size, width, height, alt, caption, credit, sha256,
            visibility::text, created_at::text
     FROM media WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  return rows.rows[0] ? toRecord(rows.rows[0]) : null;
}

export async function updateMediaMeta(
  db: SqlClient,
  id: string,
  patch: { alt?: string | null; caption?: string | null; credit?: string | null },
): Promise<MediaRecord> {
  const current = await getMedia(db, id);
  if (!current) throw new Error('not_found');
  await db.query(`UPDATE media SET alt = COALESCE($2, alt), caption = COALESCE($3, caption), credit = COALESCE($4, credit) WHERE id = $1`, [
    id,
    patch.alt ?? null,
    patch.caption ?? null,
    patch.credit ?? null,
  ]);
  const next = await getMedia(db, id);
  if (!next) throw new Error('not_found');
  return next;
}

export async function softDeleteMedia(db: SqlClient, id: string): Promise<void> {
  const current = await getMedia(db, id);
  if (!current) throw new Error('not_found');
  await db.query(`UPDATE media SET deleted_at = now() WHERE id = $1`, [id]);
}

export async function readMediaBytes(
  db: SqlClient,
  storage: StorageProvider,
  id: string,
): Promise<{ bytes: Uint8Array; mime: string } | null> {
  const row = await db.query<{ object_key: string; mime: string }>(
    `SELECT object_key, mime FROM media WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
  const found = row.rows[0];
  if (!found) return null;
  const bytes = await storage.get(found.object_key);
  if (!bytes) return null;
  return { bytes, mime: found.mime };
}
