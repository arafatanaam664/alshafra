# 01 — Implementation Gap Matrix

Status key: **IV** implemented+verified · **IU** implemented unverified · **P** partial · **X** incorrect/conflict · **M** missing · **B** blocked external · **D** deferred by design

| # | System | Status | Evidence / note |
|---|---|---|---|
| 1 | Public website (Astro) | P | Built & tested locally. **Not** production origin. |
| 2 | Legacy Vite site | IV | Still production. 127 prerender. |
| 3 | Design system | P | Tokens + Tailwind public; admin has its own CSS. No shared component library. |
| 4 | Universal content model | P | `documents` + types exist. Public renderer still type-switches on JSON. |
| 5 | CMS / Admin | P | Real UI+API+tests. JSON editor, no prod auth, no publish→HTML. |
| 6 | Workflow + revisions | P | Services + tests. UI history/restore exists. |
| 7 | Authors / E-E-A-T | P | `authors` table + seed org. Thin profiles. |
| 8 | Taxonomy / entities | P | Schema + APIs. Admin taxonomy page lists categories only. |
| 9 | Sources | P | Import + CMS add source. Not required in UI for all types. |
| 10 | SEO engine | P | Layout + document_seo + checklist. Full Article/FAQ JSON-LD not cloned from Vite. |
| 11 | Structured data | P | WebPage + WebSite only on Astro. |
| 12 | Sitemap / robots / 410 | P | Astro sitemap + `_redirects`. Vercel missing 410. |
| 13 | Internal linking | P | Manual `document_relations`. No engine. |
| 14 | Search (public) | M | FTS column + normalizeArabic exist. No `/search` UI. |
| 15 | Tools engine | P | Legacy tools live. No builder. name-decoration unpublished. |
| 16 | Calendar / converters | IV | Package + islands. Do not couple to DB. |
| 17 | Media / R2 | P | Schema only. No upload. |
| 18 | Authentication | P | Port + HMAC dev. **B** Supabase Auth project. |
| 19 | Users / RBAC | P | Roles/permissions seed + service checks. |
| 20 | Feature flags | P | DB + admin toggle. Flags do not gate public IA yet. |
| 21 | Community / Q&A | D | Tables exist, flags off, no UI. |
| 22 | Votes / reputation | D | Schema only. |
| 23 | Moderation | D | Schema only. |
| 24 | Turnstile | M | Env name only. |
| 25 | Social sharing | P | Share island on public pages. |
| 26 | OG / social images | P | Single static `og-image.jpg`. |
| 27 | Social publishing | D | Interfaces + tables. No OAuth. |
| 28 | Telegram / Meta / X | B | Need apps/tokens. |
| 29 | Automation | D | Tables only. |
| 30 | Queue / workers | D | `jobs` table, no worker. |
| 31 | Notifications | D | Types/table. |
| 32 | Internal analytics | P | Schema + zeros. No beacon. |
| 33 | Search opportunity analytics | M | Tables empty. |
| 34 | Recommendations | D | Relations only. |
| 35 | Security / audit | P | Audit writes on CMS; no rate limit/WAF in app. |
| 36 | Performance / cache | P | Static Astro. Fonts still Google CDN. |
| 37 | Accessibility | P | Skip link, RTL. No a11y suite. |
| 38 | Testing | P | urls, boundaries, PGlite import, CMS API. No Playwright. |
| 39 | Deploy / monitoring | X | Dual host leftover. Netlify command/publish mismatch on this branch. No CF Pages project in repo. |
| 40 | Jobs / scholarships / travel | D | Types/flags off. Do not expand content. |
| 41 | Comparisons / verticals | D | |
| 42 | AI assist | D | Flags off. |
| 43 | Monetization | P | ads.txt + pub id in legacy; `ads_enabled` false. |
| 44 | Progressive flags | P | Catalog seeded. |
| 45 | Opportunity research / first cluster | M | Chat requires data-driven entry. Calendar cluster already has Bing signals. |

### Incorrect or conflicting (priority)

| ID | Issue | Risk |
|---|---|---|
| C1 | Netlify `build` vs `publish` folders disagree | **Fixed M0** — both Vite |
| C2 | Vercel no 410 for `/category/*` `/languages/*` `/news/*` | **Addressed M0** in `vercel.json` routes (verify on a preview, not by guessing) |
| C3 | README says admin is “shell only” | **Fixed M0** |
| C4 | CMS publish ≠ public HTML | Editors think they shipped pages |
| C5 | Uncommitted 0–5 | **Addressed M0** — commit on this branch |
| C6 | `published.json` titles still old brand | Owner: keep titles until a later pass |
