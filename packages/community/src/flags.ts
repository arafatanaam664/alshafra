import type { SqlClient } from '@alshafra/database';

export async function flagEnabled(db: SqlClient, key: string): Promise<boolean> {
  const row = await db.query<{ is_enabled: boolean }>(`SELECT is_enabled FROM feature_flags WHERE key = $1`, [key]);
  return Boolean(row.rows[0]?.is_enabled);
}

export async function requireCommunityWrite(db: SqlClient, surface: 'questions' | 'comments'): Promise<void> {
  if (!(await flagEnabled(db, 'community_enabled'))) throw Object.assign(new Error('community_disabled'), { status: 404 });
  const surfaceKey = surface === 'questions' ? 'questions_enabled' : 'comments_enabled';
  if (!(await flagEnabled(db, surfaceKey))) throw Object.assign(new Error('community_disabled'), { status: 404 });
}

export async function communityStatus(db: SqlClient) {
  return {
    community: await flagEnabled(db, 'community_enabled'),
    questions: await flagEnabled(db, 'questions_enabled'),
    comments: await flagEnabled(db, 'comments_enabled'),
    registration: await flagEnabled(db, 'registration_enabled'),
    ugcAutoIndex: await flagEnabled(db, 'seo.ugc_auto_index'),
  };
}
