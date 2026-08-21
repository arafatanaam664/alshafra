# 13 — Redirects and 410

## Model

`redirects(source_pattern, destination, status_code, reason, is_enabled)`.

Patterns:

- Exact: `/index.html`
- Prefix: `/category/*` (one `*` at end)

Evaluation: exact first, then longest prefix.

## Status codes

| Code | Use |
|---|---|
| 301 | Permanent (index.html → /) |
| 302/307 | Temporary (rare; 307 keeps method) |
| 308 | Permanent keep method (rare) |
| 410 | Gone — old tech site |

SEO migrations of content use **301**. Ghost identity uses **410**, never 301 to homepage.

## Cloudflare implementation

Preferred: Pages `_redirects` **generated from DB at build** plus a Function fallback for runtime-added rows (SEO Manager).

Until DB exists, static `_redirects`:

```
/category/*    /410  410
/languages/*   /410  410
/news/*        /410  410
/index.html    /     301
```

This **fixes the Vercel gap** when origin is Cloudflare. Do not rely on `netlify.toml` after cutover.

## 410 body

Reuse `public/410.html` semantics: noindex, Arabic, link home. Handler `pages/410.astro`.

## Admin

SEO Manager CRUD. Creating a 301 for a HIGH URL requires reason + confirmation. Audit log.
