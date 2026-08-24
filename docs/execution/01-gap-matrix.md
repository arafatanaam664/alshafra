# 01 — Implementation Gap Matrix

Status key: **IV** implemented+verified · **IU** implemented unverified · **P** partial · **X** incorrect/conflict · **M** missing · **B** blocked external · **D** deferred by design

Updated: **2026-08-24 (Phase 15)**. Previous rows are kept. Notes in the Evidence column say what changed.

| # | System | Status | Evidence / note |
|---|---|---|---|
| 1 | Public website (Astro) | P | Built on this branch (`apps/web`, `vercel.json` → `apps/web/dist`). **Not** the live origin until merge. |
| 2 | Legacy Vite site | IV | Still production on `main`. 127 prerender. Kept as `apps/web-legacy` rollback. |
| 3 | Design system | P | Tokens + Tailwind public; admin has its own CSS. No shared component library. |
| 4 | Universal content model | P | `documents` + types exist. Public renderer still type-switches on JSON + snapshot overlay. |
| 5 | CMS / Admin | P | Real UI+API+tests. JSON editor remains. Phase 15: admin RBAC reads fixed; prod login no longer falls back to dev. Publish honesty is explicit. |
| 6 | Workflow + revisions | P | Services + tests. UI history/restore exists. |
| 7 | Authors / E-E-A-T | P | `authors` table + seed org. Thin profiles. |
| 8 | Taxonomy / entities | P | Schema + APIs. Admin taxonomy page lists categories only. |
| 9 | Sources | P | Import + CMS add source. Not required in UI for all types. |
| 10 | SEO engine | IV | Phase 7: canonical, OG, breadcrumbs, typed JSON-LD graph, sitemap index. |
| 11 | Structured data | IV | Organization, WebSite, WebPage, BreadcrumbList, Article, FAQPage, WebApplication, Event, ItemList. No JobPosting/Product. |
| 12 | Sitemap / robots / 410 | IV | Astro sitemap buckets + `vercel.json`/`netlify.toml` 410. robots.txt comment cleaned in Phase 15. |
| 13 | Internal linking | IV | Phase 8: manual first, clusters, gold↔usd pair, max 6 auto. |
| 14 | Search (public) | IV | Phase 9: `/search?q=` noindex, Arabic normalize, FTS + catalog. **Was M in the original matrix.** |
| 15 | Tools engine | IV | Phase 10: `/tools` + `/tool/:slug` client_compute. Legacy paths kept. |
| 16 | Calendar / converters | IV | Package + islands. Do not couple to DB. |
| 17 | Media / R2 | P | Phase 11: local/memory + R2 adapter. Real R2 needs owner keys. |
| 18 | Authentication | P | Phase 15: production refuses `ADMIN_DEV_LOGIN`. Supabase token verify exists. **B** hosted Supabase project. |
| 19 | Users / RBAC | IV | Phase 15: admin seed now includes the read permissions the APIs already required. |
| 20 | Feature flags | IV | Phase 15: flags + `hasPublicPage` + CMS enabled + `showInNav` = public visibility. 127 URLs stay up. |
| 21 | Community / Q&A | D | Engine + Turnstile exist. Flags off. Public writes 404. |
| 22 | Votes / reputation | D | Schema only. |
| 23 | Moderation | D | Admin moderation API exists; public community off. |
| 24 | Turnstile | P | Wired for community writes. Dev token `dev-ok` when secret empty and not production. |
| 25 | Social sharing | P | Share island on public pages. |
| 26 | OG / social images | P | Single static `og-image.jpg`. |
| 27 | Social publishing | D | Queue + stub provider. No OAuth. |
| 28 | Telegram / Meta / X | B | Need apps/tokens. |
| 29 | Automation | D | Rules created disabled. `document.published` is best-effort. |
| 30 | Queue / workers | P | `jobs` table + `runWorkers` for social. No hosted cron. |
| 31 | Notifications | D | Store list/create. No public UI / email. |
| 32 | Internal analytics | P | Phase 15: public `/api/v1/public/events` adapter on Vercel. Stores only with `DATABASE_URL`. Unique sessions not claimed. |
| 33 | Search opportunity analytics | M | Tables empty. |
| 34 | Recommendations | D | Relations only. |
| 35 | Security / audit | P | Audit writes on CMS. Production cookie now `Secure`. No full CSRF token. |
| 36 | Performance / cache | P | Static Astro. Fonts still Google CDN. |
| 37 | Accessibility | P | Skip link, RTL. No a11y suite. |
| 38 | Testing | P | urls, boundaries, CMS, SEO, engines, Phase 15 cutover. No Playwright. |
| 39 | Deploy / monitoring | P | This branch publishes Astro. Daily workflow on `main` is still Vite-root (**B** until `15-daily-publish.yml` is applied). |
| 40 | Jobs / scholarships / travel | D | Types/flags off. Do not expand content. |
| 41 | Comparisons / verticals | D | |
| 42 | AI assist | D | Flags off. |
| 43 | Monetization | P | ads.txt + pub id in legacy; `ads_enabled` false. |
| 44 | Progressive flags | P | Catalog seeded. Flags now actually hide public nav. |
| 45 | Opportunity research / first cluster | M | Calendar cluster already has demand. Do not invent new clusters. |

### Incorrect or conflicting (priority)

| ID | Issue | Risk |
|---|---|---|
| C1 | Netlify `build` vs `publish` folders disagree | **Fixed M0** — both Astro on this branch |
| C2 | Vercel no 410 for `/category/*` `/languages/*` `/news/*` | **Addressed M0** in `vercel.json` |
| C3 | README says admin is “shell only” | **Fixed M0** |
| C4 | CMS publish ≠ public HTML | **Phase 15:** snapshot + optional upload/deploy hook. UI no longer claims live. Still needs owner env for a real cutover. |
| C5 | Uncommitted 0–5 | **Addressed M0** — commit on this branch |
| C6 | `published.json` titles still old brand | Owner: keep titles until a later pass |
| C7 | `daily-publish.yml` Vite-root | **Phase 15:** patch documented, not applied (no workflows permission) |

### History

- 2026-08-21: original matrix after discovery (search **M**, media schema-only, community tables-only).
- 2026-08-24: Phase 15 refresh after verifying Phases 6–13 in the repository.
