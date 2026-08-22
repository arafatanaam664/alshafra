import { newId } from '@alshafra/kernel';
import type { SqlClient } from '@alshafra/database';
import { NEW_USER_DAYS, type CommunityMember } from './types';

function toMember(row: {
  id: string;
  email: string | null;
  display_name: string;
  handle: string | null;
  is_trusted: boolean;
  status: string;
  created_at: string;
}): CommunityMember {
  const created = Date.parse(row.created_at);
  const ageDays = Number.isFinite(created) ? (Date.now() - created) / 86400000 : 0;
  return {
    userId: row.id,
    email: row.email || '',
    displayName: row.display_name || row.email || 'عضو',
    handle: row.handle,
    isTrusted: Boolean(row.is_trusted),
    isNew: !row.is_trusted && ageDays < NEW_USER_DAYS,
    status: row.status,
  };
}

export async function loadMember(db: SqlClient, userId: string): Promise<CommunityMember | null> {
  const row = await db.query<{
    id: string;
    email: string | null;
    display_name: string;
    handle: string | null;
    is_trusted: boolean;
    status: string;
    created_at: string;
  }>(
    `SELECT id, email, display_name, handle, is_trusted, status::text, created_at::text
     FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [userId],
  );
  return row.rows[0] ? toMember(row.rows[0]) : null;
}

export async function provisionMember(
  db: SqlClient,
  input: { email: string; handle?: string; trusted?: boolean; displayName?: string },
): Promise<CommunityMember> {
  const email = input.email.trim().toLowerCase();
  const existing = await db.query<{ id: string }>(`SELECT id FROM users WHERE email = $1`, [email]);
  const userId = existing.rows[0]?.id ?? newId();
  if (!existing.rows[0]) {
    await db.query(
      `INSERT INTO users (id, email, display_name, handle, status, is_trusted)
       VALUES ($1,$2,$3,$4,'active',$5)`,
      [userId, email, input.displayName || email.split('@')[0], input.handle ?? null, Boolean(input.trusted)],
    );
    const role = await db.query<{ id: string }>(`SELECT id FROM roles WHERE key = $1`, [
      input.trusted ? 'trusted_user' : 'user',
    ]);
    if (role.rows[0]) {
      await db.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [
        userId,
        role.rows[0].id,
      ]);
    }
  } else if (input.trusted) {
    await db.query(`UPDATE users SET is_trusted = true WHERE id = $1`, [userId]);
  }
  const member = await loadMember(db, userId);
  if (!member || member.status !== 'active') throw new Error('member_inactive');
  return member;
}

export async function requireMember(db: SqlClient, userId: string): Promise<CommunityMember> {
  const member = await loadMember(db, userId);
  if (!member || member.status !== 'active') throw new Error('unauthorized');
  return member;
}
