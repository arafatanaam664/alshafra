# 47 — Risk Register

Probability/Impact: H/M/L. SEO-specific also in section 2.

## 1. Product / platform

| ID | Risk | P | I | Mitigation |
|---|---|---|---|---|
| R1 | Homepage identity change loses navigational queries | M | M | Calendar module high; staged title; inner URLs frozen |
| R2 | Dual brand (Alshafra vs تقويم السعودية vs شفرة تولز) confuses entity SEO | H | M | Human brand decision; alternateName; stop شفرة تولز on gold titles when brand locked |
| R3 | Thin programmatic catalog re-expands | H | H | Quality gate on unique text; flags; no ratePerDay publish of placeholders |
| R4 | YMYL error (wrong salary/Hijri) | M | H | Sources, review dates, ICU engine, weekend tests |
| R5 | UGC spam if community on too early | H | H | Flag off; Turnstile; noindex |
| R6 | Social API policy / token expiry | H | M | Isolated jobs; human reconnect; no password storage |
| R7 | Free-tier Supabase/R2/Pages quota | H | H | Quotas dashboard; don’t store events forever; image caps |
| R8 | R2 free storage exhaustion | M | M | Dedupe, variants, cleanup job |
| R9 | Queue polling delayed | M | L | Accept minutes latency; critical path is static |
| R10 | Auth vendor lock | L | M | AuthProvider interface |
| R11 | AdSense policy vs thin/templated pages | M | H | Don’t index padding; ads off on weak pages |
| R12 | Google algorithm / helpful content vs trending boilerplate | H | H | Rewrite padding; quality over 1500 words |
| R13 | Old tech identity still in Google | M | H | 410 on **actual** host; GSC removals (human) |
| R14 | Host mismatch (410 on Netlify, site on Vercel) | H | H | Verify DNS; implement 410 on production |
| R15 | Internal 404s (`/name-decoration`, `/{lang}`) | H | M | Prerender or unlink |
| R16 | Price API disappears | M | L | Keep last snapshot; disclaimer |
| R17 | ICU calendar missing in some runtimes | L | H | Probe + snapshot month lengths |
| R18 | Automation duplicate posts | M | M | Idempotency keys |
| R19 | Security: XSS in CMS HTML | M | H | Allowlist sanitizer |
| R20 | No measurement (no GSC/GA in code) | H | M | Connect (human) |
| R21 | Fake PDF CTA | H | L | Remove or generate file |
| R22 | SearchAction schema lie | H | L | Remove until `/search` exists |
| R23 | Conflicting robots on SPA shell | M | M | Single robots policy |
| R24 | GitHub Action force-push/commit wars | M | M | Stop using git as CMS |
| R25 | Language footer 404s | H | L | Hide unpublished locales |

## 2. SEO migration risks (required)

| Risk | P | I | Mitigation |
|---|---|---|---|
| URL changes | L (if we obey ADR-003) | H | Don’t |
| Loss of indexing | M | H | Sitemap continuity; IndexNow; GSC inspect |
| Redirect chains | L | M | Direct 301 only; none planned |
| Canonical errors | M | H | SEO module tests; no default-to-home |
| Internal link breakage | M | H | Link checker job; keep nav cluster |
| Sitemap changes | M | M | Index of sitemaps; same URLs first |
| Content duplication | H | H | MERGE policy without hasty 301; unique intros |
| Homepage intent change | H | M | ADR-002 mitigations |
| Search intent mismatch | M | M | Keep inner titles intent-first |
| Thin pages | H | H | Unique-content gate |
| Temporary ranking fluctuations | H | M | Expected; no panic 301s |
| Soft 404 return | M | H | No SPA fallback — regression test |
| 410 not applied on Vercel | H | H | R14 |

## 3. Legacy SEO risk register (transition)

See also `03-legacy-seo-preservation.md`. Treat Bing positions as **fragile**. Do not “optimize” HIGH URLs in the same release as homepage rewrite if avoidable.
