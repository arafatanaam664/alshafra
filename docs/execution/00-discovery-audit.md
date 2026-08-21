# 00 — Discovery & Repository Audit

**Date:** 2026-08-21  
**Branch:** `arena/01a02128-alshafra` (from `946880b` of 2026-08-20)  
**Source of truth order:** live code + tests → ADRs/docs → ChatGPT share → suggestions.

This is an audit, not a rewrite.

---

## 1. Product vision (from the reference chat + Phase 0)

Alshafra is **not** a blog, a news site, a forum, or a tools site alone.

It is an Arabic **digital knowledge & accomplishment platform**:

Knowledge + Solutions + Tools + Calendar/daily facts + Community + Search + Social distribution + Automation + Analytics + Monetization foundations.

Strategy locked in the chat and Phase 0:

> Broad Architecture + Narrow Launch + Data-Driven Expansion

Preserve the published calendar/tools SEO cluster (Umm Al-Qura, salaries, holidays, school calendar). Do **not** wipe legacy URLs. Homepage may TRANSFORM; tools KEEP.

Brand: public name **Alshafra**. Calendar is a **section**. `تقويم السعودية` is `alternateName`, not the primary product name.

---

## 2. Phases described in the chat

The share is a long product conversation that later became numbered implementation phases. Condensed:

| Chat phase | Intent |
|---|---|
| 0 | Product architecture, legacy audit, 127 URLs, ADRs 001–020 |
| 1 | Technical architecture (Astro, Supabase, R2, schema, RLS) |
| 2 | Repository / npm workspaces / packages |
| 3 | Astro public site, preserve 127 |
| 4 | Database + legacy import |
| 5 | CMS / Admin |
| 6+ (chat “40 stages”) | Search UI, community, social publish, automation, queues, notifications, recommendations, security hardening, opportunity research, monetization, scale |

Chat also listed a later “build order”: spec → architecture → repo → env → schema → auth → design system → CMS → tools → SEO → search → media → community → social → automation → launch flags → first content cluster.

---

## 3. Actual repository state (verified)

### Git

- **Phase 0–5 + M0 stabilize** are committed on this session branch (see `03-owner-decisions.md`). `main` remains the live Vite site until the owner merges.
- `main` at origin is still the Vite calendar site (`076eabb`, 2026-08-21 price refresh).
- Production cutover has **not** happened.

### What exists in the working tree

| Area | Reality |
|---|---|
| Public Astro | `apps/web` — 128 static pages (127 content + 404). Tests prove 127 title/canonical/h1 after `npm run build`. |
| Legacy Vite | `apps/web-legacy` — still the **production publish target**. |
| Admin | `apps/admin` — real CMS UI + Vite middleware API. Not a one-file shell anymore (README is stale). |
| DB | 11 SQL migrations, 67 tables, RLS on 66. Import 127/127 on PGlite. |
| Calendar | `@alshafra/calendar` pure domain. Golden probe 2026-06-16 ↔ 1 Muharram 1448. |
| Packages | calendar, kernel, config, ui, auth, content, seo, search, media, social, notifications, analytics, database, tools, cms |
| Docs | product / technical / repository / application_foundation / data_architecture / cms_architecture |

### Commands run in this audit

| Command | Result |
|---|---|
| `npm install` | OK |
| `npm test` | PASS — 127 inventory, boundaries, Phase 4 PGlite 127/127, Phase 5 CMS flow |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 errors, **5 pre-existing warnings** in web-legacy |

`npm run build` / `test:astro` were verified in the Phase 5 session (128 pages, 127 SEO). Not re-run in this discovery turn after install (same tree).

---

## 4. Last actually implemented stage

**Phase 5 CMS foundation is implemented in the working tree and tested**, not “just a prompt”.

Evidence:

- `packages/cms/src/*` services + `handleAdminApi`
- `apps/admin` pages + `server/vite-plugin.ts`
- `tests/cms/phase5.test.ts` PASS (401, editor publish, author cannot publish, 127 legacy still present)

It is **not** production-ready CMS (see gaps).

---

## 5. Critical conflicts

1. **Netlify command/publish mismatch** — **fixed in M0:** both target Vite (`npm run build:legacy` → `apps/web-legacy/dist`). Production origin is Vercel.
2. **Vercel 410 + wrong build** — **addressed in M0:** `buildCommand` is `npm run build:legacy`; 410 routes added for `/category` `/languages` `/news`. Verify on a preview, do not guess live headers.
3. **Public HTML is still JSON**, not CMS. Publishing in admin does not regenerate Astro pages.
4. **No hosted Supabase.** Migrations never applied to production. Owner: later, not now.
5. **Auth:** dev HMAC login only. Production login returns 501 until Supabase.
6. **Brand split remains in `published.json` titles** (`تقويم السعودية`, gold/usd still `شفرة تولز`). Owner: keep titles for now.
7. **Homepage Astro title** is rewritten; `published.json` still has the old تقويم السعودية title (intentional TRANSFORM).
8. **Git safety:** Phases 0–5 must be committed on this branch (M0).

---

## 6. Owner decisions recorded 2026-08-21

See `03-owner-decisions.md`. Headline: all eight pillars are in scope; production stays on Vercel/Vite; commit on this branch; Supabase/R2/Cloudflare later; no secrets in chat.

## 7. What we will not do next without approval

No community launch, social OAuth, AI, 16 languages, DNS cutover, deleting Vite, hosted Supabase/R2, or inventing analytics dashboards.
