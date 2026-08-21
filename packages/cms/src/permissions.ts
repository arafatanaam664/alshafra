/** Permission keys stay Phase 4 names. UI aliases map here (ADR-501). */

export const PERMISSIONS = [
  'documents.read',
  'documents.read_draft',
  'documents.create',
  'documents.update',
  'documents.publish',
  'documents.delete',
  'documents.restore',
  'documents.seo_edit',
  'seo.redirects_manage',
  'seo.force_index_ugc',
  'seo.edit_high_intent',
  'taxonomy.read',
  'taxonomy.create',
  'taxonomy.update',
  'taxonomy.delete',
  'media.read',
  'media.upload',
  'media.delete',
  'flags.read',
  'flags.toggle',
  'settings.read',
  'settings.write',
  'users.read',
  'users.roles_grant',
  'roles.read',
  'audit.read',
  'analytics.read',
  'health.read',
  'moderation.handle',
  'social.connect',
  'social.publish',
  'automation.edit',
  'community.bypass_new_user',
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number];

const ALIASES: Record<string, PermissionKey> = {
  'content.read': 'documents.read',
  'content.create': 'documents.create',
  'content.update': 'documents.update',
  'content.publish': 'documents.publish',
  'content.unpublish': 'documents.publish',
  'content.delete': 'documents.delete',
  'seo.read': 'documents.read',
  'seo.update': 'documents.seo_edit',
};

export interface Actor {
  userId: string;
  email: string;
  displayName: string;
  roles: string[];
  permissions: string[];
}

export function resolvePermission(key: string): PermissionKey | string {
  return ALIASES[key] ?? key;
}

export function hasPermission(actor: Actor | null, key: string): boolean {
  if (!actor) return false;
  if (actor.roles.includes('super_admin')) return true;
  const resolved = resolvePermission(key);
  return actor.permissions.includes(resolved) || actor.permissions.includes(key);
}

export function requirePermission(actor: Actor | null, key: string): void {
  if (!hasPermission(actor, key)) {
    const err = new Error(`forbidden:${resolvePermission(key)}`);
    err.name = 'ForbiddenError';
    throw err;
  }
}

export function isStaffRole(role: string): boolean {
  return [
    'author',
    'editor',
    'seo_manager',
    'analyst',
    'moderator',
    'social_manager',
    'admin',
    'super_admin',
  ].includes(role);
}

export function canAccessAdmin(actor: Actor | null): boolean {
  return Boolean(actor?.roles.some(isStaffRole));
}
