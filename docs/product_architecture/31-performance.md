# 31 — Performance Architecture

## Goals

- Static-first HTML for articles/guides/tools shells
- CDN-first (Cloudflare)
- Cache-first
- Minimal JS on article pages (islands only if a tool is embedded)
- Lazy below-fold
- Image variants
- Code splitting
- DB indexes
- API caching
- Revalidation on publish

## Implications vs legacy

The current SPA hydrates **everything**. Phase 1 should not ship a full React app on `/articles/hijri-calendar-1448`.

Pattern: **server-rendered or prerendered HTML + optional island**.

## Caching

| Layer | What | Invalidate |
|---|---|---|
| CDN page | published HTML | on publish/unpublish (purge path + home if linked) |
| CDN assets | hashed | immutable |
| API | snapshots (prices) | job timestamp |
| Search | materialized | on index job |
| Recs | JSON | on publish |

Revalidate: path purge. Avoid sitewide purge except flags/nav.

## Fonts

Self-host subset woff2 (400/600/700). Drop extra Google Fonts weights.

## Homepage clock

Do not re-render the whole page every second (legacy `useNow(1000)`). Isolate or use CSS/static time from build + small island.

## Budgets (targets, not promises)

Article LCP < 2.5s on mid-range mobile as a design goal. INP: avoid global 1s timers.
