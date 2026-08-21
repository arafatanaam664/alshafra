# 04 — Database Architecture

## Engine

PostgreSQL 15+ via **Supabase**. SQL is portable: no Supabase-only types in domain except `auth.users` FK which is isolated in Identity adapter.

## Naming

| Rule | Choice |
|---|---|
| Tables | **plural** `snake_case` (`documents`, `user_roles`) |
| Columns | `snake_case` |
| PK | `id` |
| FK | `{singular}_id` (`document_id`) |
| Booleans | `is_` / `has_` or verb (`indexable`) — use `is_*` except established `indexable` |
| Enums | Postgres `CREATE TYPE … AS ENUM` in `public` |
| JSONB | `*_json` suffix when unstructured (`body_json`, `payload_json`) |
| Indexes | `idx_{table}_{cols}` unique `uq_{table}_{cols}` |

## Conventions

- **PK:** `uuid` (UUIDv7) except join tables may use composite PK.
- **Timestamps:** `timestamptz` **always UTC**. Columns: `created_at`, `updated_at` (trigger), plus lifecycle columns as needed.
- **updated_at:** trigger `set_updated_at()` on all mutable tables except append-only.
- **Soft delete:** `deleted_at timestamptz null` only where specified in §Soft delete.
- **Status:** enum, never free string.
- **Locale:** `text` check `~ '^[a-z]{2}(-[A-Z]{2})?$'` default `'ar'`.
- **Paths:** `text` stored **with leading slash, no trailing slash**, unique among non-deleted public routes.

## JSONB policy

Use JSONB for:

- document `body_json` (block list)
- tool `config_json`
- job `payload_json`
- automation `conditions_json` / `actions_json`
- settings `value_json`
- audit `before_json` / `after_json`
- type-specific document `type_data_json`

Do **not** put canonical, slug, status, or path only in JSONB.

## Soft delete vs hard vs immutable

| Kind | Strategy |
|---|---|
| documents, media metadata, questions, answers, comments, users (domain) | **soft** `deleted_at` |
| document_revisions | **immutable**; never delete |
| audit_logs, analytics_events, job_attempts, social_publish_jobs (after success) | **no delete** (jobs success may be purged after 30d by job — documented retention, not user delete) |
| votes, bookmarks, follows | hard delete (toggle) |
| feature_flags, roles | no user delete; deactivate |
| price_snapshots | keep; append new |

YMYL documents: unpublish preferred over delete. Super Admin soft-delete only.

## Schemas

- `public` — app tables
- `auth` — Supabase managed
- Do not put app tables in `auth`.

## Migrations

Versioned SQL in `supabase/migrations/` (Phase 2). Expand/contract for compatibility.

## Seed (not fake users)

Roles, permissions, role_permissions, default flags, site_settings keys, tool definitions for legacy tools, 410 redirect rows, default ad_slots (empty ids).
