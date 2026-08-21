# 07 — Product Goals

## Goals (Phase 0 → Phase 1)

1. **Preserve** indexed and indexable URLs of the calendar/tools cluster.
2. **Specify** a platform that can host solutions, tools, editorial content, and (later) community without a rewrite.
3. **Separate** architecture from activation: every major module exists in the spec; most stay **flagged off**.
4. **Make SEO a system** (canonical, sitemap, quality gates, redirects, 410) rather than per-page hacks.
5. **Replace JSON-as-CMS** with a real editorial workflow, without losing static-first delivery.
6. **Keep the $0 infrastructure path** viable (Cloudflare + Supabase + R2 free tiers) without painting the product into a corner.
7. **Stop** unpublished thin-page expansion until quality rules exist.

## Non-goals (this phase and immediately after)

- Microservices.
- Native mobile apps.
- Marketplace.
- Guaranteed Google/Bing traffic.
- Indexing all UGC.
- Shipping all 15 IA sections on day one.
- Rewriting Hijri math in a new language “for cleanliness”.
- Changing `/date-converter` or sibling URLs to look “more RESTful”.

## Success metrics (directional — not forecasts)

| Area | Leading indicator |
|---|---|
| Preservation | 127 URLs still 200, self-canonical, in sitemap |
| Ghost URLs | `/category/*` returns 410 on production |
| Editorial | Articles edited without committing JSON to git |
| Quality | No new public URL below index threshold |
| Performance | Article HTML usable with JS disabled |
| Risk | Feature flags can disable community, ads, social publish |

## Anti-metrics

- Page count.
- Languages count.
- Words padded to 1500.
- Social posts published regardless of failure isolation (posts may fail; articles must not).
