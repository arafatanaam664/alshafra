# 21 — SEO Architecture

SEO is a first-class module, not tags sprinkled in components.

## URL strategy

See `40-url-architecture.md`. Legacy wins.

Slug strategy for **new** content: Arabic or English kebab, short, no dates unless year-document, immutable after publish.

## On-page

Every indexable document:

- Unique title (~50–65 glyphs, intent first)
- Unique meta description
- Single H1 matching intent
- Self canonical
- Robots
- OG + Twitter
- Breadcrumbs
- Image alt
- Language `ar` + `dir=rtl`

## Index control

Computed `indexable = published && !flag_off && quality_pass && robots_override !== noindex`.

Quality for programmatic:

- Unique entities
- Unique non-boilerplate text (boilerplate tails do **not** count)
- Sources for YMYL
- Not duplicate of a stronger URL

## Pagination

`rel=next/prev`, self canonical, no infinite faceted URLs.

## Errors

| Code | Use |
|---|---|
| 404 | Never existed / unknown |
| 410 | Known gone (old tech site, deliberately removed) |
| 301 | Permanent move only |
| 302 | Temporary (rare) |

No soft 404. No SPA fallback to 200.

## Structured data

Graph per page, multiple types allowed, stable `@id`s.

## Programmatic SEO

Allowed for: country gold/USD (already), year calendars, named events.

Not allowed: one page per keyword permutation, per-letter spam, per-name spam, unless unique meaning pages pass the gate.

## Image SEO

OG 1200×630 on R2. Filename/alt descriptive. Do not hotlink random stock.

## Redirect registry

Admin-editable. Exported to Cloudflare Redirects. Includes 410 list.

## Change management

Title/H1 changes on HIGH SEO URLs require SEO Manager (or a checklist) because of the Bing/Google early signals.
