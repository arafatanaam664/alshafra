import type { SqlClient } from '@alshafra/database';
import type { StorageProvider } from './types';

export interface GcCandidate {
  id: string;
  objectKey: string;
  variantKeys: string[];
}

export async function gcCandidates(db: SqlClient, olderThanDays = 30): Promise<GcCandidate[]> {
  const cutoff = new Date(Date.now() - olderThanDays * 86400000).toISOString();
  const rows = await db.query<{ id: string; object_key: string }>(
    `SELECT m.id, m.object_key
     FROM media m
     WHERE m.deleted_at IS NOT NULL
       AND m.deleted_at < $1::timestamptz
       AND NOT EXISTS (SELECT 1 FROM documents d WHERE d.featured_media_id = m.id)
       AND NOT EXISTS (SELECT 1 FROM document_seo s WHERE s.og_image_media_id = m.id)
       AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.avatar_media_id = m.id)`,
    [cutoff],
  );
  const out: GcCandidate[] = [];
  for (const row of rows.rows) {
    const variants = await db.query<{ object_key: string }>(`SELECT object_key FROM media_variants WHERE media_id = $1`, [
      row.id,
    ]);
    out.push({
      id: row.id,
      objectKey: row.object_key,
      variantKeys: variants.rows.map((item) => item.object_key),
    });
  }
  return out;
}

export async function runMediaGc(
  db: SqlClient,
  storage: StorageProvider,
  olderThanDays = 30,
): Promise<{ deleted: number }> {
  const candidates = await gcCandidates(db, olderThanDays);
  for (const item of candidates) {
    for (const key of new Set([item.objectKey, ...item.variantKeys])) {
      await storage.delete(key);
    }
    await db.query(`DELETE FROM media_variants WHERE media_id = $1`, [item.id]);
    await db.query(`DELETE FROM media WHERE id = $1`, [item.id]);
  }
  return { deleted: candidates.length };
}
