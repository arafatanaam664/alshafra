# 46 — Architecture Decision Records

Each ADR: Context, Decision, Alternatives, Reason, Trade-offs, Consequences.

---

## ADR-001 Legacy Migration Strategy

**Context:** Live site with 127 published URLs, early Bing signals, previous tech-site ghost URLs, JSON CMS.  
**Decision:** Strangler pattern. Keep public URLs and engines. Replace delivery (SPA→static islands) and authoring (JSON→CMS) behind the same paths. 410 remains for `/category|/languages|/news`.  
**Alternatives:** Big-bang rewrite with new slugs; ignore legacy and launch parallel site.  
**Reason:** Preservation principle; search intent is on inner URLs.  
**Trade-offs:** New IA is slightly inconsistent (`/date-converter` vs `/tool/...`).  
**Consequences:** Redirect table starts empty. Import JSON as published revisions.

---

## ADR-002 Homepage Strategy

**Context:** Homepage is branded تقويم السعودية and ranks/serves calendar intent. Product wants Alshafra platform identity.  
**Decision:** **Rewrite homepage in place at `/`.** Keep calendar module high on the page. Do not 301 `/` anywhere. Inner calendar URLs unchanged.  
**Alternatives:** Keep old homepage; put platform at `/home` or `/app`.  
**Reason:** Spec allows homepage redesign; inner SEO is the asset.  
**Trade-offs:** Possible ranking fluctuation on navigational queries.  
**Consequences:** Title suffix change is staged (human approval). See `54-homepage-migration.md`.

---

## ADR-003 URL Preservation

**Context:** Temptation to normalize `/date-converter` → `/tool/date-converter`.  
**Decision:** Never change a published path without ADR + 301 plan. New content uses new patterns. Do not reuse `/category/`.  
**Alternatives:** Prefix everything with type.  
**Reason:** SEO preservation.  
**Trade-offs:** Mixed URL aesthetics.  
**Consequences:** Router must support both legacy and new patterns.

---

## ADR-004 Frontend Architecture

**Context:** Vite SPA + prerender works but hydrates all pages; articles should be HTML-first. Team knows React. Target Cloudflare Pages.  
**Decision:** **React-based App Router or Astro with React islands**, chosen at Phase 1 spike, with a hard constraint: article/guide HTML is complete without JS. Prefer **Astro + React islands** for public site and a React admin; acceptable alternative **Next.js App Router** with RSC and static output / OpenNext. Domain engines stay framework-agnostic TypeScript.  
**Alternatives:** Keep Vite prerender forever; go Vue; full SSR only.  
**Reason:** Performance-first + reuse React tool UIs.  
**Trade-offs:** Two rendering modes (public vs admin). OpenNext on Cloudflare is operationally heavier.  
**Consequences:** Phase 1 starts with a short spike (human: pick Astro vs Next). Hijri engines port as packages, not as page rewrites.

---

## ADR-005 Backend Architecture

**Context:** No backend today. Need CMS, jobs, later community.  
**Decision:** TypeScript modular monolith. Public read mostly static. Mutations via server functions/workers talking to Supabase. Domain modules not imported from UI only.  
**Alternatives:** Supabase-only (no workers); separate Python API; Firebase.  
**Reason:** One language, $0 stack, extractable modules.  
**Trade-offs:** TS everywhere.  
**Consequences:** No business rules only in React components.

---

## ADR-006 Database

**Context:** Content in git JSON.  
**Decision:** **Supabase Postgres** as system of record for CMS, users, jobs, flags. JSON import is one-way.  
**Alternatives:** SQLite on D1; continue git CMS; Mongo.  
**Reason:** Auth+Postgres together; SQL FTS; portable later.  
**Trade-offs:** Free-tier row/storage limits.  
**Consequences:** Hijri math still in code, not SQL.

---

## ADR-007 Storage

**Decision:** **Cloudflare R2** for blobs. Postgres holds metadata only.  
**Alternatives:** Supabase Storage; git LFS.  
**Reason:** Avoid double lock-in; S3-compatible.  
**Trade-offs:** Two vendors (CF + Supabase).  
**Consequences:** Cleanup jobs required on free quota.

---

## ADR-008 Authentication

**Decision:** **Supabase Auth** behind `AuthProvider`. Email + Google. Registration flagged off until community/comments need it.  
**Alternatives:** Cloudflare Access only (admin); Clerk; custom JWT.  
**Reason:** Fast, $0, replaceable.  
**Trade-offs:** Vendor auth.  
**Consequences:** Admin and community share identity store.

---

## ADR-009 Content Architecture

**Decision:** Editorial `Content` vs UGC tables. Types as in model. `path` is first-class and can be legacy.  
**Alternatives:** Everything is a Post; MDX files in git.  
**Reason:** SEO/ads/moderation differ.  
**Trade-offs:** More tables.  
**Consequences:** Import maps JSON → Content.

---

## ADR-010 CMS

**Decision:** Custom CMS in Admin (not WordPress, not a third-party hosted CMS). Workflow statuses as specified.  
**Alternatives:** Sanity/Strapi/Contentful; continue JSON.  
**Reason:** $0, RTL, path control, YMYL fields.  
**Trade-offs:** We build editor UX.  
**Consequences:** Phase 1 includes a modest block editor, not Notion.

---

## ADR-011 Community

**Decision:** Full model specified; **flag off**. Q&A not a skin on articles. Default noindex.  
**Alternatives:** Disqus; launch forum immediately; never do community.  
**Reason:** Build once, activate later; spam risk.  
**Trade-offs:** Unused schema until then.  
**Consequences:** No public `/question` until flags + Turnstile + mods.

---

## ADR-012 Search

**Decision:** Postgres FTS first, Arabic normalization in app, `SearchProvider` for later Meilisearch/OpenSearch. `/search` noindex.  
**Alternatives:** Client FlexSearch; Algolia.  
**Reason:** $0, good enough, swappable.  
**Trade-offs:** Weak stemming.  
**Consequences:** Synonym table required.

---

## ADR-013 Social Publishing

**Decision:** Provider adapters, per-job status, templates in admin, OAuth/tokens not passwords. Isolated from content publish.  
**Alternatives:** Buffer/Zapier; manual only forever.  
**Reason:** Spec + failure isolation.  
**Trade-offs:** API policy risk (X, Meta).  
**Consequences:** Flag off until apps approved.

---

## ADR-014 Automation

**Decision:** Trigger/condition/action rules stored in DB, actions = enqueue jobs.  
**Alternatives:** Hardcoded if/else; n8n.  
**Reason:** Human control, simple.  
**Trade-offs:** Not a full workflow engine.  
**Consequences:** No cycles, no Turing-complete scripts in v1.

---

## ADR-015 Queue

**Decision:** Postgres job table + cron worker. Interface allows Cloudflare Queues later. Idempotency keys. Dead status.  
**Alternatives:** In-request; GitHub Actions only; Redis.  
**Reason:** $0 and correct isolation.  
**Trade-offs:** Polling latency.  
**Consequences:** GitHub Action remains optional for prices until worker exists.

---

## ADR-016 SEO

**Decision:** SEO module owns canonical, robots, sitemap index, redirect/410 registry, quality gate, breadcrumbs. Preserve 127 URLs. Homepage may change.  
**Alternatives:** Per-page ad hoc tags (status quo).  
**Reason:** Past canonical/soft-404 incidents.  
**Trade-offs:** More process for title changes.  
**Consequences:** SEO Manager role.

---

## ADR-017 Analytics

**Decision:** GA4 + GSC + Bing external; internal event bus for product events.  
**Alternatives:** Plausible only; nothing.  
**Reason:** Need search + product.  
**Trade-offs:** Google JS.  
**Consequences:** Load GA async, consent-aware.

---

## ADR-018 Feature Flags

**Decision:** DB-backed flags, admin UI, defaults as in `34`.  
**Alternatives:** Env vars only.  
**Reason:** Activate without deploy.  
**Trade-offs:** Cache purge needed.  
**Consequences:** Indexed URLs not killed by flags.

---

## ADR-019 Deployment

**Decision:** Cloudflare Pages as target production. Supabase + R2. Migrate off Vercel/Netlify when DNS is ready. Until then, production host must serve 410 rules.  
**Alternatives:** Stay on Vercel; Fly.io.  
**Reason:** Product constraint + $0.  
**Trade-offs:** SSR options differ.  
**Consequences:** Dual config is debt until cutover.

---

## ADR-020 Scalability

**Decision:** Modular monolith in one TypeScript repo (`modules/*`). No microservices.  
**Alternatives:** Split now; serverless per function chaos.  
**Reason:** Principles 6–12.  
**Trade-offs:** Discipline required.  
**Consequences:** Codeowners per module later.

---

## ADR-021 Eight pillars, one platform

**Context:** The reference chat listed seven site ideas. The live site is an eighth (calendar). The owner refused to pick one niche.  
**Decision:** Alshafra implements **all eight** as pillars of one product. Architecture and CMS types exist now. Public activation is flagged and sequenced. Calendar is pillar 8 and the current beachhead.  
**Alternatives:** Kill calendar and start a solutions-only site; keep calendar-only forever.  
**Reason:** Owner lock 2026-08-21; matches “broad architecture + narrow launch”.  
**Trade-offs:** IA is wider than the first public cluster.  
**Consequences:** No thin indexed hubs. See `56-eight-pillars.md`.

---

## ADR-022 Stay on Vercel until full cutover

**Context:** Dual Vercel/Netlify configs. Target architecture is Cloudflare Pages.  
**Decision:** **Vercel remains production** until the owner says the project is complete, then Cloudflare. Do not change DNS now. Vite remains the publish target.  
**Alternatives:** Cut to Astro/Cloudflare immediately.  
**Reason:** Owner lock 2026-08-21; avoid a mid-migration outage.  
**Trade-offs:** Dual-app drift continues.  
**Consequences:** `vercel.json` `buildCommand` is `npm run build:legacy`. Astro is preview-only until M3.
