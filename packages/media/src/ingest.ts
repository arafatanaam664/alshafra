import { newId } from '@alshafra/kernel';
import type { SqlClient } from '@alshafra/database';
import { mediaObjectKey } from './keys';
import { publicObjectUrl } from './public';
import type { StorageProvider } from './types';
import { VARIANT_PLAN, validateEditorialImage } from './validate';
import type { IngestInput, IngestResult, MediaRecord, VariantPlan } from './types';

function plannedVariants(): VariantPlan[] {
  return VARIANT_PLAN.map((row) => ({ ...row }));
}

function toRecord(row: {
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
}): MediaRecord {
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
  };
}

export async function ingestEditorial(
  db: SqlClient,
  storage: StorageProvider,
  input: IngestInput,
): Promise<IngestResult> {
  const validated = validateEditorialImage(input.bytes, input.contentType);
  const visibility = input.visibility === 'private' ? 'private' : 'public';
  const existing = await db.query<{
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
    deleted_at: string | null;
  }>(
    `SELECT id, object_key, mime, byte_size, width, height, alt, caption, credit, sha256, visibility::text, deleted_at
     FROM media WHERE sha256 = $1 ORDER BY created_at ASC LIMIT 1`,
    [validated.sha256],
  );
  const found = existing.rows[0];
  if (found) {
    if (found.deleted_at) {
      await db.query(`UPDATE media SET deleted_at = NULL, updated_at = now() WHERE id = $1`, [found.id]);
    }
    return { media: toRecord(found), reused: true, variantsPlanned: plannedVariants() };
  }

  const id = newId();
  const key = mediaObjectKey(id, 'original', validated.ext, new Date(), visibility);
  await storage.put({
    key,
    bytes: validated.bytes,
    contentType: validated.mime,
    sha256: validated.sha256,
    variant: 'original',
  });

  await db.query(
    `INSERT INTO media (
       id, bucket, object_key, mime, byte_size, width, height, alt, caption, credit, sha256, uploaded_by, visibility
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::media_visibility)`,
    [
      id,
      storage.driver === 'r2' ? 'r2' : storage.driver,
      key,
      validated.mime,
      validated.bytes.byteLength,
      validated.width,
      validated.height,
      input.alt ?? null,
      input.caption ?? null,
      input.credit ?? null,
      validated.sha256,
      input.uploadedBy ?? null,
      visibility,
    ],
  );
  const variantId = newId();
  await db.query(
    `INSERT INTO media_variants (id, media_id, variant, object_key, mime, width, height, byte_size)
     VALUES ($1,$2,'original',$3,$4,$5,$6,$7)`,
    [variantId, id, key, validated.mime, validated.width, validated.height, validated.bytes.byteLength],
  );

  return {
    media: toRecord({
      id,
      object_key: key,
      mime: validated.mime,
      byte_size: validated.bytes.byteLength,
      width: validated.width,
      height: validated.height,
      alt: input.alt ?? null,
      caption: input.caption ?? null,
      credit: input.credit ?? null,
      sha256: validated.sha256,
      visibility,
    }),
    reused: false,
    variantsPlanned: plannedVariants(),
  };
}
