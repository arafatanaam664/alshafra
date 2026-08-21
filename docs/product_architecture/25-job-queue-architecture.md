# 25 — Job / Queue Architecture

Heavy work never runs inside the user/editor HTTP request beyond “insert job”.

## Phase 1 (free tier)

**Postgres `jobs` table + Cloudflare Cron / GitHub Actions / Worker poller.**

Not Cloudflare Queues (paid) until budget exists. Interface allows swap.

```
Job { id, type, payload, status, attempts, max_attempts, run_at, idempotency_key, last_error, locked_at }
```

Status: `queued | running | succeeded | failed | dead`.

## Job types (initial)

`prices.fetch`, `content.revalidate`, `sitemap.rebuild`, `indexnow.submit`, `search.index`, `media.variant`, `social.publish`, `notify.dispatch`, `analytics.rollups`

## Retry

Exponential backoff. After `max_attempts` → `dead` (dead letter concept = status + admin UI, same table).

## Idempotency

`idempotency_key` unique. Example: `social:telegram:{content_id}:{template_version}`.

Retry of a succeeded key returns the original `external_id` and **does not post again**. Providers that do not support lookup: store “posted fingerprint” ourselves.

## Observability

Job logs in admin. Failed social jobs do not appear as unpublished articles.

## Concurrency

One worker per type where possible. `daily-publish` GitHub Action already uses a concurrency group — keep that idea.
