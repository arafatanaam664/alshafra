# 05 — Database Schema

Postgres `public`. Types first, then tables. All `id uuid PK` UUIDv7 unless noted.

Editorial supertype is **`documents`** (not one table per type). Phase 0 listed `articles` as an example — this is the resolved model.

---

## Enums

```sql
CREATE TYPE user_status AS ENUM ('active','suspended','banned','deleted');
CREATE TYPE document_type AS ENUM (
  'article','guide','solution','news','trend','faq_page','comparison',
  'opportunity','job','scholarship','tool_page','calendar_content',
  'service_info','collection','legal'
);
CREATE TYPE document_status AS ENUM (
  'idea','draft','review','scheduled','published','unpublished','archived'
);
CREATE TYPE robots_directive AS ENUM (
  'index_follow','noindex_follow','index_nofollow','noindex_nofollow'
);
CREATE TYPE tool_runtime AS ENUM ('static','island');
CREATE TYPE tool_data_mode AS ENUM ('none','build_snapshot','client_compute','server_fetch');
CREATE TYPE job_status AS ENUM ('queued','running','succeeded','failed','dead');
CREATE TYPE social_provider AS ENUM ('facebook','telegram','x','instagram','linkedin','youtube');
CREATE TYPE social_account_status AS ENUM ('connected','expired','revoked','error');
CREATE TYPE publish_job_status AS ENUM ('queued','running','succeeded','failed','cancelled');
CREATE TYPE report_status AS ENUM ('open','accepted','rejected','ignored');
CREATE TYPE moderation_target AS ENUM ('question','answer','comment','user','document');
CREATE TYPE vote_target AS ENUM ('question','answer','comment');
CREATE TYPE notification_channel AS ENUM ('in_app','email');
CREATE TYPE redirect_status AS ENUM ('301','302','307','308','410');
```

410 is stored in `redirects` with `status_code=410` and nullable destination.

---

## Identity & users

### `users`
Domain user. Not `auth.users`.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| auth_user_id | uuid UNIQUE NULL | FK conceptually to `auth.users.id` |
| handle | citext UNIQUE NULL | public `/user/:handle` |
| display_name | text | |
| email | text UNIQUE NULL | copy for admin; auth is source |
| status | user_status | default active |
| reputation_points | int | default 0, ≥0 |
| is_trusted | bool | Trusted User grant |
| created_at, updated_at, deleted_at | timestamptz | |

### `profiles`
1:1 optional extras: bio, avatar_media_id, locale, timezone (display only).

### `roles`
id, `key` unique (`visitor` is not stored — implicit), `name`, `is_system`.

Keys: `user`, `trusted_user`, `moderator`, `editor`, `seo_manager`, `social_manager`, `analyst`, `admin`, `super_admin`.

### `permissions`
id, `key` unique (`documents.publish`), `module`, `description`.

### `role_permissions`
role_id, permission_id, PK (role_id, permission_id).

### `user_roles`
user_id, role_id, granted_by, created_at, PK (user_id, role_id).

---

## Taxonomy

### `categories`
id, `key` unique, `name`, `path` unique NULL (public hub path — **never** `/category/...`), `parent_id`, `sort_order`, `is_published`, timestamps, deleted_at.

### `topics`
id, `key` unique (`saudi-calendar`, `umm-al-qura`), `name`, timestamps.

### `tags`
id, `slug` unique, `name`, timestamps.

---

## Content

### `authors`
Staff/org bylines. id, user_id NULL, `name`, `slug`, `is_organization`, timestamps.

### `documents`

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| type | document_type | |
| status | document_status | |
| locale | text | default `ar` |
| title | text | H1 default |
| slug | text | last segment; unique per locale+type where needed |
| path | text UNIQUE | **public URL**, legacy first-class |
| legacy_path | text NULL | import trace |
| excerpt | text | |
| body_json | jsonb | block list |
| type_data_json | jsonb | solution steps, job dates, … |
| author_id | uuid | FK authors |
| category_id | uuid NULL | FK categories |
| featured_media_id | uuid NULL | |
| published_revision_id | uuid NULL | FK revisions (deferrable) |
| published_at, scheduled_at, reviewed_at | timestamptz | |
| unpublished_at | timestamptz | |
| indexable | bool | computed + stored |
| indexable_override | bool NULL | SEO Manager |
| ads_enabled | bool | default true |
| feature_flag_key | text NULL | |
| unique_text_word_count | int | quality |
| created_at, updated_at, deleted_at | | |

Check: `path ~ '^/'` and `path !~ '/$'` or path = `'/'`.

### `document_revisions`
id, document_id, `version` int, author_user_id, `title`, `excerpt`, `body_json`, `type_data_json`, `seo_json`, `created_at`. UNIQUE (document_id, version). **No deleted_at. No UPDATE of body.**

### `document_seo`
1:1 document_id PK.

seo_title, meta_description, canonical_url, robots robots_directive, og_title, og_description, og_image_media_id, schema_type text, schema_json jsonb, h1_override text NULL.

### `document_tags` / `document_topics`
M2M. topics have `weight int default 1`.

### `document_relations`
from_id, to_id, `kind` (`related`,`parent`,`canonical_of`), `is_manual` bool, sort_order. UNIQUE (from_id, to_id, kind).

### `faq_items`
id, document_id, question, answer, sort_order.

### `sources`
id, document_id, label, url, accessed_at.

---

## Media

### `media`
id, `bucket` text default `media`, `object_key` unique, `mime`, `byte_size`, `width`, `height`, `alt`, `credit`, `sha256`, uploaded_by, `visibility` (`public`,`private`), created_at, deleted_at.

### `media_variants`
id, media_id, `variant` (`original`,`thumbnail`,`medium`,`large`,`social`,`og`), `object_key` unique, mime, width, height, byte_size.

---

## Tools & calendar

### `tools`
id, `key` unique (`date-converter`), `path` unique (legacy URL), `name`, `description`, `engine_key`, runtime, data_mode, `config_json`, `disclaimer`, `status` (`active`,`hidden`), document_id NULL (tool_page copy), timestamps.

### `calendar_programs`
Salary-like programs: id, `key` unique (`employee-salaries`), title, day_of_month, `weekend_rule` bool, source_label, source_url, timestamps.

### `calendar_events`
id, `key` unique, title, category, `gregorian_date` date, `hijri_rule_json` NULL, is_holiday, holiday_days, description, timestamps.

### `countdown_definitions`
id, slug unique, title, question, category, `schedule_json`, keywords, related slugs json, tool-ish FAQ via faq_items on linked document.

### `price_snapshots`
id, `captured_at`, `xau_usd` numeric, `source` text, `rates_json` jsonb. Append-only.

---

## Routes & SEO infra

### `routes`
id, `path` UNIQUE, `handler_kind` (`document`,`tool`,`countdown`,`prices`,`static`,`gone`,`redirect`), document_id NULL, tool_id NULL, `http_status` int default 200, `is_legacy` bool, timestamps.

This is the **Legacy Route Resolver** table. Seeded with 127 paths.

### `redirects`
id, `source_pattern` unique (exact or prefix `*`), `destination` text NULL, `status_code` int check in (301,302,307,308,410), `reason`, `is_enabled`, created_at, updated_at.

Seed:

- `/category/*` 410
- `/languages/*` 410
- `/news/*` 410
- `/index.html` 301 `/`

---

## Community (flag off; schema exists)

### `questions`
id, author_id, title, slug, `path` generated `/question/{id}/{slug}`, body, category_id, status (`open`,`closed`,`hidden`), `indexable` default false, accepted_answer_id NULL, timestamps, deleted_at.

### `answers`
id, question_id, author_id, body, is_accepted, timestamps, deleted_at.

### `comments`
id, author_id, `target_type`, `target_id`, body, timestamps, deleted_at.

### `votes`
user_id, target_type, target_id, `value` smallint check in (-1,1), created_at. PK (user_id, target_type, target_id).

### `bookmarks` / `follows` / `mentions`
Standard M2M / notification sources.

### `reputation_events`
id, user_id, `action`, points, target_type, target_id, created_at. Append-only.

### `badges` / `user_badges`

---

## Moderation, notifications

### `reports`
id, reporter_id NULL, target_type, target_id, reason, body, status, created_at.

### `moderation_actions`
id, actor_id, target_type, target_id, `action`, reason, metadata_json, created_at. Append-only.

### `notifications`
id, recipient_id, type, actor_id NULL, entity_type, entity_id, payload_json, read_at, created_at.

---

## Social, automation, jobs

### `social_accounts`
id, provider, `external_account_id`, `account_name`, `token_ref` text (pointer to secret store, **not** raw token), `refresh_token_ref`, status, metadata_json, connected_by, timestamps.

### `social_templates`
id, provider, `name`, `body_template`, is_default, timestamps.

### `social_posts`
id, document_id, provider, account_id, template_id, `rendered_json`, created_at.

### `social_publish_jobs`
id, social_post_id, status, attempts, max_attempts, `idempotency_key` UNIQUE, external_post_id, permalink, last_error, run_at, completed_at.

### `automation_rules`
id, `name`, `trigger`, conditions_json, actions_json, `is_enabled`, cooldown_seconds, created_by, timestamps.

### `automation_runs`
id, rule_id, event_id text, status, payload_json, created_at.

### `jobs`
id, `type`, payload_json, status, priority int, attempts, max_attempts, run_at, locked_at, locked_by, idempotency_key UNIQUE NULL, last_error, completed_at, failed_at, created_at, updated_at.

### `job_attempts`
id, job_id, attempt_n, started_at, finished_at, error, log_json.

---

## Search, analytics, flags, settings, ads, audit

### `search_synonyms`
id, `term`, `synonym`, locale.

### `search_queries`
id, `query_normalized`, `query_length`, result_count, created_at. **No raw IP. No user email.** Optional user_id hash.

### `popular_searches`
query_normalized PK, locale, hit_count, updated_at.

### `analytics_events`
id, `name`, `path`, document_id NULL, tool_id NULL, props_json, `occurred_at`, `session_hash` NULL. No IP, no UA full string required (optional truncated).

### `feature_flags`
id, `key` UNIQUE, `is_enabled`, `environment` text default `all`, `rollout_percent` int default 100, metadata_json, updated_at.

### `site_settings`
`key` PK text, value_json, updated_at, updated_by.

Groups encoded in key prefix: `site.`, `seo.`, `social.`, `ads.`, `community.`

### `ad_slots`
id, `key` unique (`in_article`), `adsense_slot_id` text NULL.

### `ad_placements`
id, slot_id, `page_pattern`, `is_enabled`, sort_order.

### `audit_logs`
id, actor_id NULL, `action`, entity_type, entity_id, before_json, after_json, ip_hash NULL, request_id, created_at. **INSERT only.**
