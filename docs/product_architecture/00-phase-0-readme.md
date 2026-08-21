# Phase 0 — Product Discovery, Legacy Audit & Master Specification

**Project:** Alshafra  
**Domain:** https://alshafra.com  
**Phase:** 0 (documentation and architecture only — no production code)  
**Date:** 2026-08-20  
**Status:** COMPLETE (pending human decisions listed in `49-phase-1-readiness.md`)

---

## How to read this folder

If you are an engineer who has never seen Alshafra:

1. Read this file.
2. Read `01-legacy-site-audit.md` then `02-legacy-url-inventory.md`.
3. Read `06-product-vision.md` and `09-information-architecture.md`.
4. Read `45-architecture-principles.md` and `46-architecture-decisions.md`.
5. Use the module docs (CMS, Community, Tools, SEO, Social, Queue…) as contracts for Phase 1.
6. Do **not** start database/API/frontend implementation until the human decisions in `49-phase-1-readiness.md` are answered.

Arabic is the product language. English identifiers are used for modules, flags, URLs, and ADRs.

---

## What Alshafra was

A live Arabic site on `alshafra.com` currently branded **تقويم السعودية** (Saudi Calendar): Hijri/Gregorian dates, Umm Al-Qura conversion, Saudi salaries and support payment dates, school calendar, official holidays, countdowns, gold/USD tables, and a set of long editorial pages.

The domain previously hosted an unrelated tech-news / programming-lessons site (`/category/*`, `/languages/*`, `/news/*`). Those URLs are intended to return **410 Gone**.

There is **no CMS, no database, no auth, no community**. The production system is a Vite + React SPA with a custom pathname router and a Node prerenderer that emits static HTML.

## What Alshafra will become

An Arabic RTL-first platform for **practical information + tools + solutions + community + distribution**.

Owner lock (2026-08-21): the product includes **all seven chat ideas plus the live calendar site as the eighth**. See `56-eight-pillars.md`.

The calendar/timing cluster is **not discarded**. It is pillar 8 inside a wider product identity named **Alshafra**.

Philosophy:

**PRESERVE WHAT HAS VALUE + RESTRUCTURE WHAT NEEDS IMPROVEMENT + BUILD THE NEW PLATFORM ON TOP OF EXISTING ASSETS**

---

## Document map

| File | Contents |
|---|---|
| `00-phase-0-readme.md` | This index |
| `01-legacy-site-audit.md` | Reverse-engineered current system |
| `02-legacy-url-inventory.md` | Every published URL + actions |
| `03-legacy-seo-preservation.md` | Signals, canonicals, index rules |
| `04-legacy-content-migration.md` | KEEP/UPDATE/EXPAND/MERGE/REWRITE |
| `05-legacy-tools-integration.md` | Each current tool |
| `06-product-vision.md` | New product identity |
| `07-product-goals.md` | Goals and non-goals |
| `08-target-users.md` | Personas |
| `09-information-architecture.md` | Sections, navigation, activation |
| `10-content-model.md` | Entities and relationships |
| `11-feature-map.md` | Features vs phases vs flags |
| `12-user-roles.md` | RBAC matrix |
| `13-user-journeys.md` | Core journeys |
| `14-business-rules.md` | Product rules |
| `15-cms-architecture.md` | Editorial CMS |
| `16-community-architecture.md` | Q&A, votes, reputation |
| `17-tools-platform.md` | Tool runtime |
| `18-search-architecture.md` | Postgres FTS first |
| `19-internal-linking.md` | Linking engine |
| `20-recommendation-engine.md` | Rule-based |
| `21-seo-architecture.md` | SEO system |
| `22-social-sharing.md` | Share buttons + OG |
| `23-social-publishing.md` | Provider adapters |
| `24-automation-engine.md` | Trigger / condition / action |
| `25-job-queue-architecture.md` | Jobs, retry, DLQ |
| `26-media-architecture.md` | R2 |
| `27-analytics.md` | GA + internal events |
| `28-notifications.md` | In-app first |
| `29-moderation.md` | Reports, bans, UGC gate |
| `30-security.md` | AuthZ, XSS, uploads |
| `31-performance.md` | Static-first |
| `32-scalability.md` | Modular monolith |
| `33-monetization.md` | Ads without harming SEO |
| `34-feature-flags.md` | Flags and defaults |
| `35-admin-dashboard.md` | Admin IA |
| `36-settings.md` | Site settings |
| `37-deployment.md` | Cloudflare + Supabase + R2, $0 |
| `38-disaster-recovery.md` | Backups |
| `39-observability.md` | Logs and health |
| `40-url-architecture.md` | New vs preserved URLs |
| `41-content-lifecycle.md` | Draft → archive |
| `42-versioning.md` | Revisions |
| `43-ai-extension-points.md` | Optional AI |
| `44-future-expansion.md` | PWA, API, languages |
| `45-architecture-principles.md` | 15 principles |
| `46-architecture-decisions.md` | ADR-001 … ADR-020 |
| `47-risk-register.md` | Product + SEO + infra risks |
| `48-known-unknowns.md` | Known / unknown / verify |
| `49-phase-1-readiness.md` | What Phase 1 may start |
| `50-phase-0-summary.md` | Executive close-out |
| `51-architecture-diagrams.md` | Required Mermaid diagrams |
| `52-permission-matrix.md` | Full RBAC table |
| `53-legacy-migration-matrix.md` | Per-URL migration matrix |
| `54-homepage-migration.md` | New homepage spec |
| `55-cross-document-consistency.md` | Self-review log |
| `56-eight-pillars.md` | Owner lock: all 7 chat ideas + live calendar as #8 |

---

## Non-negotiables for later phases

1. Do not change a valuable existing URL without a documented 301 plan.
2. Do not publish thin programmatic pages.
3. Do not index UGC by default.
4. Do not run heavy work inside HTTP requests.
5. Do not hard-code “every section launches on day one”.
6. Do not couple domain logic to one vendor (Supabase, Cloudflare, one AI, one social API).
7. Do not promise traffic or rankings.

---

## Current live facts (verified in-repo + live fetch 2026-08-20)

- Live homepage title: **تقويم السعودية | مواعيد الرواتب وحساب المواطن والتقويم الهجري والميلادي**
- `robots.txt` allows `/` and points to `https://alshafra.com/sitemap.xml`
- `published.json`: **127** Arabic URLs
- Stack: React 18 + Vite + Tailwind + custom router + prerender
- Hosting configs present for **Vercel and Netlify**; target architecture is **Cloudflare Pages + Supabase + R2**
- AdSense publisher id is already in `index.html` and `ads.txt`
- No `.env` usage except `VITE_ADSENSE_ENABLED` / `VITE_ADSENSE_SLOTS`

Proceed to `01-legacy-site-audit.md`.
