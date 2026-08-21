# 07 — Database RLS

RLS **on** for every public table. Service role (worker/build/BFF) bypasses RLS — therefore **BFF must enforce RBAC** even when using service role. RLS protects accidental client access and admin-app direct Supabase use.

Helper:

```sql
CREATE FUNCTION public.current_user_id() RETURNS uuid ...
-- maps auth.uid() → users.id
CREATE FUNCTION public.has_permission(text) RETURNS boolean ...
```

## Policy matrix (sensitive tables)

Legend: P = published+not deleted; O = own row; E = editor+; A = admin+; S = super; M = moderator+; SEO = seo_manager+.

### documents

| | anon | authenticated user | editor | seo | admin |
|---|---|---|---|---|---|
| SELECT | P and indexable or P public pages (status published, deleted_at null) | same + own drafts if author mapped | all non-deleted | all | all |
| INSERT | no | no | yes | no | yes |
| UPDATE | no | no | yes (not robots override unless SEO) | seo columns | yes |
| DELETE | no | no | no | no | soft via update deleted_at super/admin |

Anon SELECT must **not** include drafts. `indexable` false still SELECT if published (e.g. noindex page still 200) — **yes, published noindex is readable**.

### document_revisions

SELECT: editor+. INSERT: editor+ (append). UPDATE/DELETE: **deny all** (including admin; super via service role only for disaster).

### users / profiles

SELECT: own; staff can list. UPDATE: own profile fields; admin status/roles via user_roles.

### user_roles / permissions

SELECT: admin+ or own roles. WRITE: super_admin only.

### media

SELECT: public visibility rows; editor+ all. INSERT: editor+ or user avatar later. UPDATE: owner/editor.

### questions/answers/comments

SELECT: not hidden/deleted. INSERT: authenticated if flags. UPDATE: own body or mod hide. DELETE: soft mod/admin.

### votes

INSERT/DELETE: own. SELECT: aggregates via view; raw votes staff.

### jobs, social_accounts, site_settings, feature_flags, redirects, audit_logs

No anon. WRITE: admin/social/seo as per permission keys. audit_logs INSERT via trigger/service, SELECT admin+.

### analytics_events / search_queries

INSERT: service role (from BFF). SELECT: analyst+. No UPDATE.

### price_snapshots, calendar_* 

SELECT: published/public (anon). WRITE: service role / editor for events.

## Never

`GRANT ALL TO authenticated`.  
Never `USING (true)` on write.  
Never expose `token_ref` decrypt via view.

## Tests

See `48-testing.md` — RLS tests with anon/auth/editor JWTs.
