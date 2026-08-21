# 21 — API Architecture

## Style

**REST** JSON, versioned `/api/v1`. No GraphQL.

## Surfaces

| Surface | Base | Auth |
|---|---|---|
| Public | mostly **no API** (HTML) | — |
| Public API | `/api/v1/public/*` | none or optional |
| Authenticated | `/api/v1/me/*` | user |
| Admin | `/api/v1/admin/*` | staff RBAC |
| Internal | Worker-to-module in-process | service role, not exposed |

Public endpoints (limited): `POST /api/v1/public/events` (analytics beacon), `GET /api/v1/public/search` (or SSR only — **decision: search is SSR page first; JSON later**), tool compute is **client island** using bundled calendar package (no server roundtrip for Hijri).

Prices: JSON at `/api/v1/public/prices/latest` CDN cached 1h.

## Versioning

`/api/v1`. Breaking change → `/api/v2`. Additive fields allowed in v1.

## Idempotency

`Idempotency-Key` header required for `POST` admin publish and social retries. Stored on jobs.

## Caching

Public GET: `Cache-Control: public, max-age=60, s-maxage=3600` where safe. Admin: `private, no-store`.

## CORS

Same-origin only for admin. Public GET prices: `*` GET if needed for future apps — **not** in v1.

## Pagination

`?cursor=` opaque (UUIDv7) + `limit` max 100. Avoid `offset` on large tables.
