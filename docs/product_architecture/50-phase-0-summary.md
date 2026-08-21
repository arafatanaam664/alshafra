# 50 — Phase 0 Summary

## PHASE 0 COMPLETE

Documentation-only. No production code changed. No Phase 1 schema/API/UI implementation started.

---

## 1. Files created

All under `docs/product_architecture/`:

`00-phase-0-readme.md` … `50-phase-0-summary.md` plus:

- `51-architecture-diagrams.md`
- `52-permission-matrix.md`
- `53-legacy-migration-matrix.md`
- `54-homepage-migration.md`
- `55-cross-document-consistency.md`
- `56-eight-pillars.md` (owner lock 2026-08-21)

---

## 2. Legacy audit — headline results

Alshafra.com is a **live prerendered React SPA** branded **تقويم السعودية**, not an empty repo.

- **127** Arabic URLs in `public/published.json` (2026-08-20).
- Strong **calendar / salaries / conversion / holidays / school** cluster with real engines (ICU Umm Al-Qura, Riyadh TZ, weekend payday rule).
- 7 sourced editorial articles + 18 countdowns + 35 `/trending` guides + 21×2 gold/USD country pages.
- **No** CMS, DB, auth, community, or search.
- A **16-language catalog** exists in code and is mostly unpublished (quality gate).
- `/name-decoration` is linked but **not prerendered**.
- Previous tech site URLs should be **410**; rules live in Netlify files and may be missing on Vercel.
- Brand is already split: تقويم السعودية vs شفرة تولز vs domain Alshafra.
- Historical fatal SEO bugs (soft 404, noscript, canonical-to-home, button nav, wrong Hijri) appear **fixed in source**; Google’s remaining old identity is **NEEDS VERIFICATION**.

---

## 3. URL action counts (published 127)

| Action | Count |
|---|---:|
| KEEP | 0 |
| KEEP + UPGRADE | **113** |
| TRANSFORM | **10** |
| MERGE | **4** (keep URLs; no 301 in Phase 0) |
| REDIRECT | 0 among published (`/index.html` → `/` is extra) |
| REMOVE | **0** |
| NO DECISION YET | 0 among published; **catalog families + unpublished locales** sit here |

TRANSFORM: `/`, `/about`, `/trending`, `/trending/today`, 6 category hubs.  
MERGE (overlap only): gold/dollar/school/support trending guides vs stronger tools/articles.

Unpublished in code: 6 name-decoration URLs → KEEP + UPGRADE after prerender; 15 language hubs → NO DECISION YET.

---

## 4. SEO assets that must be kept

- Paths: `/date-converter`, `/hijri-calendar`, `/today`, `/salaries`, `/school-calendar`, `/holidays`, `/countdown/*`, `/age-calculator`, `/articles/*`
- Early Bing signals on Umm Al-Qura, salaries, holidays 2026/2027, school calendar (treat as fragile)
- Self-canonical, generated sitemap, IndexNow, ads.txt, 410 philosophy for old tech URLs
- Do **not** reuse `/category/`, `/languages/`, `/news/`

---

## 5. Key architectural decisions

1. Strangler migration: same URLs, new platform behind them.
2. Homepage rewrite at `/`; inner calendar URLs frozen.
3. Modular monolith, TypeScript, flags.
4. Supabase Postgres + Auth (interface), R2 media, Cloudflare Pages target.
5. CMS for editorial; UGC separate and default noindex.
6. Postgres FTS first.
7. Queue = jobs table + cron; social isolated + idempotent.
8. AI optional, never YMYL-authoritative.
9. $0 free-tier path, paid-capable later.
10. Frontend: Astro islands **or** Next.js — spike required (H3).

---

## 6. Top risks

- 410 not applied on the real host.
- Thin/templated programmatic pages (trending padding, catalog).
- Homepage/brand change vs inner-query success.
- Free-tier quotas.
- Internal 404s (`/name-decoration`, `/{lang}`).
- UGC/social if enabled too early.
- YMYL factual error.

---

## 7. Top unknowns

GSC/Bing exports, DNS host today, AdSense approval, whether old `/category` is still indexed, whether `/en` 404s.

---

## 8. Ready for Phase 1 (after human H1–H4)

Preserve/prerender gaps, 410 on production, engine extraction, CMS import without URL changes, flags, homepage, measurement. **Not** community, not 16 languages, not URL renaming.

---

## 9. Human decisions before Phase 1

H1 brand, H2 title suffix, H3 Astro vs Next, H4 host cutover. See `49-phase-1-readiness.md`.

---

## Quality bar

A new engineer with this folder + the old repo can answer: what Alshafra was, what it will be, what not to break, how tools/content merge, how CMS/community/social/SEO/automation work, and where module boundaries are — without guessing URLs.

**PHASE 0 COMPLETE**
