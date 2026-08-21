# 15 — Sitemap Architecture

## Index

`https://alshafra.com/sitemap.xml` → sitemapindex.

Children:

| File | Includes |
|---|---|
| `/sitemaps/core.xml` | `/`, legal, faq, hubs |
| `/sitemaps/articles.xml` | type article published indexable |
| `/sitemaps/guides.xml` | `/trending/*` indexable |
| `/sitemaps/tools.xml` | tools + countdowns + gold/usd |
| `/sitemaps/calendar.xml` | hijri, school, holidays, today, salaries |
| `/sitemaps/community.xml` | **empty until** UGC indexable |

No tags sitemap until tag archives are indexable (default noindex).

## Rules

- Only 200 + indexable.
- `lastmod` = `reviewed_at` ?? `updated_at` ?? `published_at`. Not build time except `/today` and price hubs.
- loc without trailing slash.
- Rebuild job debounced 60s after publish.
- IndexNow: URLs whose lastmod changed this run, max 1000.

## Generation

Build + on-demand Function with CDN cache 1h, purge on job.
