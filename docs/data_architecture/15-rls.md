# 15 — RLS

RLS is **on** for application tables. Table owner / service role bypasses RLS, therefore BFF must still enforce RBAC (ADR-108).

Helpers: `current_user_id()` maps `auth.uid()` → `users.id`; `has_permission(text)`.

Anon SELECT: published documents (`status=published AND deleted_at IS NULL`), public media, active tools, calendar data, routes. **Drafts are not anon-readable.** Published noindex pages remain SELECT-able (they still 200).

Writes: permission keys (`documents.create`, `flags.toggle`, …). `document_revisions` has no UPDATE/DELETE policy.

Never `GRANT ALL TO authenticated`. Never put `service_role` in the frontend.
