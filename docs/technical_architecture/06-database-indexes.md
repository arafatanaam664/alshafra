# 06 — Database Indexes

B-tree unless noted. Unique constraints implied indexes omitted from “extra”.

## Critical

| Index | Why |
|---|---|
| `uq_documents_path` UNIQUE `documents(path)` WHERE deleted_at IS NULL | Resolver + sitemap |
| `idx_documents_status_published` `(status, published_at DESC)` WHERE deleted_at IS NULL AND status='published' | lists |
| `idx_documents_type_status` `(type, status)` | CMS filters |
| `idx_documents_category` `(category_id)` | |
| `idx_documents_indexable` `(indexable)` WHERE indexable AND deleted_at IS NULL | sitemap |
| `idx_routes_path` UNIQUE `routes(path)` | hot path |
| `idx_redirects_source` UNIQUE `redirects(source_pattern)` WHERE is_enabled | |
| `idx_tools_path` UNIQUE `tools(path)` | |
| `idx_users_auth` UNIQUE `users(auth_user_id)` | login map |
| `idx_users_handle` UNIQUE `users(handle)` WHERE handle IS NOT NULL | |
| `idx_jobs_status_run` `(status, run_at)` WHERE status IN ('queued','running') | worker |
| `uq_jobs_idempotency` UNIQUE `jobs(idempotency_key)` WHERE idempotency_key IS NOT NULL | |
| `uq_social_jobs_idem` UNIQUE `social_publish_jobs(idempotency_key)` | |
| `idx_revisions_doc_version` UNIQUE `(document_id, version)` | |
| `idx_faq_document` `(document_id)` | |
| `idx_media_sha` `(sha256)` | dedupe |
| `idx_analytics_occurred` `(occurred_at DESC)` | retention jobs |
| `idx_audit_created` `(created_at DESC)` | |
| `idx_notifications_recipient` `(recipient_id, read_at)` | inbox |
| `idx_questions_indexable` WHERE indexable | |
| `idx_search_queries_norm` `(query_normalized, created_at DESC)` | |

## Full text

Generated column on `documents`:

```sql
search_tsv tsvector GENERATED ALWAYS AS (
  to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(excerpt,''))
) STORED;
CREATE INDEX idx_documents_fts ON documents USING gin (search_tsv);
```

Arabic: `'simple'` + app normalization into `title_normalized` / `body_normalized` text columns indexed. Do not pretend `arabic` config is excellent (Phase 0). Optional: `pg_trgm` GIN on `title` for prefix suggestions — **NEEDS VERIFICATION** if extension allowed on Supabase free.

## Soft-delete partials

All unique public paths use `WHERE deleted_at IS NULL` so a slug can be reused after soft delete **only** if SEO Manager allows (default: do not reuse HIGH URLs).
