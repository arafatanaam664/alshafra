import { newId } from '@alshafra/kernel';
import type { SqlClient } from '@alshafra/database';
import {
  listingCanAppearPublic,
  listingIsExpired,
  parseListingData,
  type ListingData,
  type OpportunityKind,
} from '@alshafra/content';
import { createDocument, transitionDocument } from './content';
import { hasPermission, requirePermission, type Actor } from './permissions';

function requireListingsRead(actor: Actor | null) {
  if (hasPermission(actor, 'documents.read') || hasPermission(actor, 'documents.create') || hasPermission(actor, 'documents.publish')) {
    return;
  }
  requirePermission(actor, 'documents.read');
}

const TYPES = new Set(['job', 'scholarship', 'opportunity']);

function typeForKind(kind: OpportunityKind): 'job' | 'scholarship' | 'opportunity' {
  if (kind === 'job') return 'job';
  if (kind === 'scholarship') return 'scholarship';
  return 'opportunity';
}

export async function listOpportunityAdmin(db: SqlClient, actor: Actor | null) {
  requireListingsRead(actor);
  const rows = await db.query<{
    id: string;
    type: string;
    status: string;
    title: string;
    path: string;
    type_data_json: unknown;
    published_at: string | null;
  }>(
    `SELECT id, type::text AS type, status::text AS status, title, path, type_data_json, published_at::text
     FROM documents
     WHERE deleted_at IS NULL AND type::text IN ('job','scholarship','opportunity')
     ORDER BY updated_at DESC`,
  );
  return rows.rows.map((row) => {
    const data = parseListingData(row.type_data_json);
    return {
      ...row,
      listing: data,
      expired: data ? listingIsExpired(data) : false,
    };
  });
}

export async function createOpportunity(
  db: SqlClient,
  actor: Actor,
  input: {
    title: string;
    excerpt?: string;
    kind: OpportunityKind;
    listing: Omit<ListingData, 'kind'> & { kind?: OpportunityKind };
  },
) {
  requirePermission(actor, 'documents.create');
  const kind = input.listing.kind || input.kind;
  const listing = parseListingData({ ...input.listing, kind });
  if (!listing) throw new Error('invalid_listing');
  const created = await createDocument(db, actor, {
    type: typeForKind(kind),
    title: input.title,
    excerpt: input.excerpt,
  });
  await db.query(`UPDATE documents SET type_data_json = $2::jsonb WHERE id = $1`, [created.id, JSON.stringify(listing)]);
  return created;
}

export async function updateOpportunityListing(db: SqlClient, actor: Actor, id: string, listing: ListingData) {
  requirePermission(actor, 'documents.update');
  const parsed = parseListingData(listing);
  if (!parsed) throw new Error('invalid_listing');
  const current = await db.query<{ type: string }>(`SELECT type::text AS type FROM documents WHERE id = $1 AND deleted_at IS NULL`, [id]);
  if (!current.rows[0] || !TYPES.has(current.rows[0].type)) throw new Error('not_found');
  await db.query(`UPDATE documents SET type_data_json = $2::jsonb WHERE id = $1`, [id, JSON.stringify(parsed)]);
  return { id, listing: parsed };
}

export async function listPublicOpportunities(db: SqlClient, flags: Record<string, boolean>) {
  const rows = await db.query<{
    id: string;
    type: string;
    status: string;
    title: string;
    path: string;
    excerpt: string | null;
    type_data_json: unknown;
    body_json: unknown;
  }>(
    `SELECT id, type::text AS type, status::text AS status, title, path, excerpt, type_data_json, body_json
     FROM documents
     WHERE deleted_at IS NULL AND status = 'published' AND type::text IN ('job','scholarship','opportunity')
     ORDER BY published_at DESC NULLS LAST`,
  );
  return rows.rows
    .map((row) => ({ ...row, listing: parseListingData(row.type_data_json) }))
    .filter((row) =>
      listingCanAppearPublic({
        published: row.status === 'published',
        data: row.listing,
        flags,
      }),
    );
}

export async function publishOpportunity(db: SqlClient, actor: Actor, id: string) {
  return transitionDocument(db, actor, id, 'published');
}

export { newId };
