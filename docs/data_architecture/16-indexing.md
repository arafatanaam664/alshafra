# 16 — Indexing

Unique constraints implied indexes omitted.

| Index | Why |
|---|---|
| `uq_documents_path` partial unique | Resolver; reuse after soft-delete only if SEO allows |
| `idx_documents_status_published` | Lists |
| `idx_documents_type_status` | CMS filters |
| `idx_documents_category` / `idx_documents_author` | Relations |
| `idx_documents_indexable` | Sitemap |
| `idx_documents_fts` GIN `search_tsv` | FTS |
| `idx_routes_path` unique | Hot path |
| `idx_tools_path` unique | Tool resolver |
| `idx_jobs_status_run` partial | Worker later |
| `idx_analytics_occurred` | Retention |
| `idx_audit_created` | Admin |
| `uq_price_snapshots_natural` | Idempotent snapshots |

No random indexes. `pg_trgm` is **not** enabled (NEEDS VERIFICATION on Supabase free).
