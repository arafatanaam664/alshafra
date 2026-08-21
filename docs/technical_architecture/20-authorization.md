# 20 — Authorization (RBAC)

## Model

Role → many Permissions (`key` strings). User → many Roles. Trusted User is a role **or** `users.is_trusted` (both: role preferred).

Resource-level: `documents.update` allowed for Editor on all editorial; UGC update only if `author_id = current` unless Moderator.

Scope object optional later (`own` vs `any`). v1: encode in permission keys `comments.update_own` vs `comments.hide_any`.

## Enforcement

1. BFF: `requirePermission(session, key)`  
2. RLS: `has_permission(key)`  
3. UI: hide buttons (not security)

## Matrix

Identical to Phase 0 `52-permission-matrix.md`. Technical keys listed in seed:

`documents.create`, `documents.publish`, `documents.seo_edit`, `seo.redirects_manage`, `seo.force_index_ugc`, `media.upload`, `social.connect`, `social.publish`, `automation.edit`, `flags.toggle`, `settings.write`, `users.roles_grant`, `audit.read`, `moderation.handle`, `analytics.read`, `community.bypass_new_user`, …

Visitor has zero keys. Published HTML is not an API permission.

## Admin `/admin`

All routes require session + at least one staff role (not bare `user`).
