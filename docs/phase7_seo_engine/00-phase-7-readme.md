# Phase 7 — SEO Engine (chat مرحلة 9)

Implemented on Astro, not Vite.

## Features (all in this phase)

| Feature | Where |
|---|---|
| Canonical, no trailing slash | `@alshafra/seo` `selfCanonical` |
| Intent-first titles, no auto `\| Alshafra` | `documentTitle` |
| Robots + index gate | `robotsContent` / sitemap filter |
| Open Graph + Twitter + image alt/size | `openGraph` + `SiteLayout` |
| Breadcrumbs + BreadcrumbList | `breadcrumbsFor` + `Breadcrumbs.astro` |
| JSON-LD `@graph` by real type | `buildJsonLdGraph` |
| Sitemap index + 5 children | `/sitemap.xml`, `/sitemaps/*.xml` |
| 410 registry | `GONE_PREFIXES` (kept on Vercel) |
| Pagination helpers | `relNextPrev` (silent until a list paginates) |
| Hreflang ready | emits nothing until two real locales exist |

## Schema actually emitted

Organization, WebSite, WebPage, BreadcrumbList, Article (articles/guides/solutions), FAQPage (≥2 FAQs), WebApplication (tools), Event (countdowns with a date), ItemList (hubs).

**Not emitted:** SearchAction (no `/search` yet), JobPosting, Product, fake HowTo, 16-language hreflang, community sitemap.

## Out of scope

Community, social publishing, AI, DNS, deleting Vite, changing the 127 URLs.
