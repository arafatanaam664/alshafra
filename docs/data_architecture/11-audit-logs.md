# 11 — Audit Logs

`audit_logs` is append-only: actor_id, action, entity_type, entity_id, before_json, after_json, ip_hash (not raw IP), request_id, created_at.

RLS: SELECT for `audit.read`; INSERT allowed (service/triggers). No UPDATE/DELETE policies.

Sensitive actions to log later: publish, unpublish, delete, restore, SEO change, permissions, feature flags, social publish, moderation.

No fake audit rows are seeded.
