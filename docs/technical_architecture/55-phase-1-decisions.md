# 55 — Phase 1 Decision Log (ADR-101 … ADR-116)

Phase 0 ADRs 001–020 remain valid except **ADR-004 frontend is now Astro (H3)** and **brand H1/H2**.

---

## ADR-101 Astro

**Context:** Need HTML-first public site; team knows React.  
**Decision:** Astro + `@astrojs/react` islands.  
**Alternatives:** Next.js, keep Vite prerender.  
**Why:** H3, SEO, CF Pages, less JS.  
**Trade-offs:** Admin is a second app; two mental models.  
**Consequences:** Port pages to `.astro`; engines to packages.

## ADR-102 Supabase

**Decision:** Postgres + Auth on Supabase. Domain SQL portable.  
**Alternatives:** D1, Neon, self-host.  
**Why:** Auth+RLS+$0.  
**Trade-offs:** Pause/500MB.  
**Consequences:** Cron heartbeat; dump backups.

## ADR-103 Cloudflare Pages

**Decision:** Production target Pages. No new Vercel.  
**Alternatives:** Stay Vercel, Netlify.  
**Why:** H4.  
**Trade-offs:** Functions CPU 10ms free.  
**Consequences:** 410 via `_redirects`; leave vercel.json until cutover.

## ADR-104 R2

**Decision:** Blobs on R2; metadata in Postgres.  
**Alternatives:** Supabase Storage.  
**Why:** ADR-007, zero egress.  
**Trade-offs:** Two vendors.  
**Consequences:** Key convention `media/{yyyy}/{mm}/{uuid}/{variant}.ext`.

## ADR-105 Modular Monolith

**Decision:** `packages/*` + 21 modules, one repo.  
**Alternatives:** Microservices.  
**Why:** Phase 0 principle.  
**Trade-offs:** Discipline.  
**Consequences:** Import graph 60.

## ADR-106 PostgreSQL FTS

**Decision:** `simple` FTS + Arabic normalize; SearchProvider.  
**Alternatives:** Algolia, Meilisearch now.  
**Why:** $0, swappable.  
**Trade-offs:** Stemming weak.

## ADR-107 Supabase Auth

**Decision:** AuthProvider; domain `users` separate; email+Google.  
**Alternatives:** Cloudflare Access only.  
**Why:** Future community.  
**Trade-offs:** Vendor.  
**Consequences:** registration_enabled false.

## ADR-108 RLS

**Decision:** RLS on all tables; BFF still RBAC with service role.  
**Alternatives:** RLS only or app only.  
**Why:** Defense in depth.  
**Trade-offs:** Dual enforcement.

## ADR-109 URL Preservation

**Decision:** 127 paths 200; no prefix rewrite.  
**Why:** Phase 0.  
**Consequences:** tests 62.

## ADR-110 Legacy Route Resolver

**Decision:** `routes` + `redirects` tables + Astro file mirrors.  
**Alternatives:** Only file routes.  
**Why:** CMS-managed 410/301 without deploys.  
**Trade-offs:** Cache invalidation.

## ADR-111 Social Adapter

**Decision:** `SocialProvider` interface; jobs isolated.  
**Why:** Phase 0. Flag off.

## ADR-112 Job Queue

**Decision:** Postgres jobs + cron SKIP LOCKED.  
**Alternatives:** CF Queues (paid).  
**Why:** $0.

## ADR-113 Feature Flags

**Decision:** DB flags, admin, defaults Phase 0.  
**Why:** Activate later.

## ADR-114 UGC SEO

**Decision:** Default noindex; v1 no auto-index even if scores pass (`seo.ugc_auto_index=false`).  
**Why:** Spam.  
**Trade-offs:** Slow community SEO later.

## ADR-115 Arabic URL Strategy

**Decision:** Never change existing Latin slugs. New editorial may use Arabic NFC slugs. New tools Latin kebab.  
**Alternatives:** All Arabic; all Latin.  
**Why:** Preserve SEO; DX for tools; Arabic OK for new articles.  
**Trade-offs:** Mixed.  
**Consequences:** encoding in sitemaps.

## ADR-116 ID Strategy

**Decision:** UUIDv7 in app.  
**Alternatives:** v4, bigint.  
**Why:** sort + non-enumerable.  
**Trade-offs:** larger indexes than bigint.
