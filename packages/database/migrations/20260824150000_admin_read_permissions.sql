-- Phase 15: give operational admin the read permissions the control plane already checks.
-- Super admin already bypasses in hasPermission(); this keeps the table honest.
-- Does not grant seo.force_index_ugc, seo.edit_high_intent, or users.roles_grant.

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.key IN ('admin', 'super_admin')
  AND p.key IN (
    'documents.read',
    'documents.update',
    'flags.read',
    'settings.read',
    'health.read',
    'users.read',
    'roles.read',
    'taxonomy.read',
    'taxonomy.create',
    'taxonomy.update'
  )
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_analytics_session_path_day
  ON analytics_events (session_hash, path, occurred_at);
