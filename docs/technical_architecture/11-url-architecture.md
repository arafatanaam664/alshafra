# 11 — URL Architecture (technical)

## Laws (from Phase 0 + H1)

1. The 127 published paths stay 200 with self-canonical.  
2. No `/category/`, `/languages/`, `/news/` reuse.  
3. No trailing slash. HTTPS. Host `alshafra.com`.  
4. New objects use new patterns only.  
5. Title branding: H2 (intent first, no automatic `| Alshafra`).

## Resolver order (every request)

```
1. Normalize (lowercase path except we do not lowercase encoded Arabic; strip trailing slash; reject /index.html → 301)
2. Exact match redirects table
3. Prefix 410 patterns
4. Exact match routes table (legacy + new)
5. Astro file routes (must equal routes table for public)
6. 404
```

Never rewrite unknown → `/` or `index.html`.

## Handler kinds

| kind | Example | Render |
|---|---|---|
| document | `/articles/…`, `/trending/:slug` | SSG/SSR HTML |
| tool | `/date-converter` | SSG HTML + island |
| countdown | `/countdown/ramadan` | SSG + island tick |
| prices | `/gold-price/egypt` | SSG from snapshot |
| static | `/about` | SSG |
| collection | `/articles` | SSG |
| gone | `/category/x` | 410 HTML |
| redirect | `/index.html` | 301 |

## New patterns (unchanged from Phase 0)

`/solution/:slug`, `/tool/:slug` (new tools only), `/guide/:slug` (new, not moving `/trending`), `/question/:id/:slug`, `/topics/:slug` (**not** `/category/`), `/tag/:slug`, `/user/:handle`, `/search` (noindex).

## Arabic slugs (ADR-115)

- **Existing Latin slugs never change.**
- New editorial **may** use Arabic Unicode slugs (NFC, spaces → `-`, no leading/trailing `-`).
- New **tools** default Latin kebab for DX and sharing.
- Encode in sitemaps as RFC 3986. Display decoded in UI.
- Do not mix two documents on the same path.

## Canonical

Always `https://alshafra.com{path}`. Query strings stripped (`utm` ignored).
