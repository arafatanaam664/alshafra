# 58 — Phase 1 Summary

## PHASE 1 COMPLETE

Blueprint only. No production CMS/community/social/deployment.

---

## Stack (final)

**Astro + React islands + TypeScript** · **Cloudflare Pages** · **Supabase Postgres + Auth** · **R2** · Zod · Postgres FTS · Postgres jobs + Cron · REST `/api/v1` · UUIDv7 · RTL Alshafra brand.

Not Next.js. No new Vercel.

---

## Database summary

Editorial **`documents`** (+ revisions, seo, faqs, sources, relations). Users decoupled from `auth.users`. `routes` + `redirects` for compatibility/410. Tools/calendar/prices tables. Community/social/jobs/flags/audit/ads schema **present**, flags **off**.

---

## Modules

21 modules; graph in `60`; rules in `61`. Calendar package is the Hijri source.

---

## API summary

Public: prices, events beacon, health. Admin: documents CRUD/publish, media, redirects, flags. Auth cookie session. Community/social endpoints specified, not to be enabled.

---

## Security summary

RBAC + RLS, sanitized HTML, no SVG UGC, rate limits, Turnstile on auth, secrets in env/vault, service role server-only.

---

## SEO compatibility

H2 intent titles, self-canonical, sitemap index, quality on unique text, UGC noindex, 410 prefixes, no `/category` reuse, SearchAction removed until search exists. Organization name **Alshafra** + alternateName تقويم السعودية.

---

## Legacy URLs

127 published paths stay 200 via `LegacyRouteResolver` + Astro files. Matrix: `62-legacy-route-regression-matrix.md`. Extra: name-decoration to add. Unknown → 404. Old tech → 410.

---

## Top risks

URL miss on port · Supabase pause · Worker CPU · 500MB DB · free-tier number drift.

---

## Unknowns

Exact vendor quotas at kickoff · DNS today · H6 today-index · pg_trgm/uuidv7 extensions · R2 versioning.

---

## Phase 2 will

Astro foundation, migrations, calendar port, 127 URL compatibility, document import, flags/settings, 410 on Cloudflare, SEO tests.

## Phase 2 will not

Full CMS UI polish, community launch, social OAuth live, 16 languages, URL renaming, production DNS cutover unless ops-ready, deleting Vite until tests pass.
