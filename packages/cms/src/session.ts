import { createHmac, timingSafeEqual } from 'node:crypto';
import { newId } from '@alshafra/kernel';
import type { SqlClient } from '@alshafra/database';
import { canAccessAdmin, type Actor } from './permissions';

const COOKIE = 'alshafra_admin_session';

export function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.CRON_SECRET || '';
}

export function signSession(payload: string, secret: string): string {
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySession(token: string, secret: string): string | null {
  const i = token.lastIndexOf('.');
  if (i < 1) return null;
  const payload = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = createHmac('sha256', secret).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return payload;
}

export async function loadActor(db: SqlClient, userId: string): Promise<Actor | null> {
  const user = await db.query<{ id: string; email: string | null; display_name: string }>(
    `SELECT id, email, display_name FROM users WHERE id = $1 AND deleted_at IS NULL AND status = 'active'`,
    [userId],
  );
  const row = user.rows[0];
  if (!row) return null;
  const roles = await db.query<{ key: string }>(
    `SELECT r.key FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = $1`,
    [userId],
  );
  const perms = await db.query<{ key: string }>(
    `SELECT DISTINCT p.key
     FROM user_roles ur
     JOIN role_permissions rp ON rp.role_id = ur.role_id
     JOIN permissions p ON p.id = rp.permission_id
     WHERE ur.user_id = $1`,
    [userId],
  );
  const actor: Actor = {
    userId: row.id,
    email: row.email || '',
    displayName: row.display_name || row.email || 'staff',
    roles: roles.rows.map((r) => r.key),
    permissions: perms.rows.map((p) => p.key),
  };
  return canAccessAdmin(actor) ? actor : null;
}

export async function provisionStaff(
  db: SqlClient,
  email: string,
  roleKey: string,
): Promise<Actor> {
  const existing = await db.query<{ id: string }>(`SELECT id FROM users WHERE email = $1`, [email]);
  const userId = existing.rows[0]?.id ?? newId();
  if (!existing.rows[0]) {
    await db.query(
      `INSERT INTO users (id, email, display_name, status) VALUES ($1,$2,$3,'active')`,
      [userId, email, email.split('@')[0]],
    );
  }
  const role = await db.query<{ id: string }>(`SELECT id FROM roles WHERE key = $1`, [roleKey]);
  const roleId = role.rows[0]?.id;
  if (!roleId) throw new Error('unknown_role');
  await db.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [userId, roleId]);
  const actor = await loadActor(db, userId);
  if (!actor) throw new Error('not_staff');
  return actor;
}

export function encodeCookie(userId: string, secret: string): string {
  const payload = Buffer.from(JSON.stringify({ sub: userId, exp: Date.now() + 7 * 86400000 })).toString('base64url');
  const token = signSession(payload, secret);
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
}

export function clearCookie(): string {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function readCookie(header: string | null): string | null {
  if (!header) return null;
  const parts = header.split(';');
  for (const p of parts) {
    const [k, ...rest] = p.trim().split('=');
    if (k === COOKIE) return rest.join('=');
  }
  return null;
}

export async function actorFromCookie(db: SqlClient, cookieHeader: string | null, secret: string): Promise<Actor | null> {
  if (!secret) return null;
  const raw = readCookie(cookieHeader);
  if (!raw) return null;
  const payload = verifySession(raw, secret);
  if (!payload) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { sub: string; exp: number };
    if (!data.sub || data.exp < Date.now()) return null;
    return loadActor(db, data.sub);
  } catch {
    return null;
  }
}

export { COOKIE as ADMIN_COOKIE };
