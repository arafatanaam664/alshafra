# 03 — Legacy SEO Preservation & Migration Strategy

Traffic and rankings are **not promised**. Bing impressions and positions cited by stakeholders are treated as **early signals**, not as proof of durable authority.

---

## 1. SEO evidence we actually have

### 1.1 In-repo / stakeholder Bing queries (early signals)

| Query | Reported signal | Likely landing class |
|---|---|---|
| تقويم ام القرى 1448 | Strong intent | `/hijri-calendar`, `/articles/hijri-calendar-1448` |
| تحويل التاريخ ام القرى | Strong intent | `/date-converter`, `/articles/hijri-to-gregorian-conversion` |
| مواعيد رواتب الموظفين الحكوميين | Strong intent | `/salaries`, `/articles/salary-dates-saudi-arabia`, `/countdown/employee-salaries` |
| اجازات السعودية 2026 و2027 | Strong intent | `/holidays`, `/articles/official-holidays-saudi-arabia` |
| التقويم الدراسي 2026-2027 | Position ≈ 3 (reported) | `/school-calendar`, `/articles/school-calendar-1448` |
| تقويم اجازات 2026 2027 | Position ≈ 1 (reported) | `/holidays` |
| تحويل التاريخ من ميلادي الى هجري أم القرى | Position ≈ 3 (reported) | `/date-converter` |
| جدول صرف رواتب 2026 | Strong intent | `/salaries` + salary article |

**Rule:** Do not change URLs, titles, or H1s of these clusters without a measured reason. Homepage identity **may** change; these inner URLs **may not**.

### 1.2 What we do **not** have (NEEDS VERIFICATION)

- Google Search Console export (pages, queries, coverage).
- Bing Webmaster full query report.
- Current index count vs 127 sitemap URLs.
- Whether `/category/*` is still indexed.
- Backlink profile.
- Core Web Vitals field data.
- Whether production host applies 410 (Vercel vs Netlify).

Until those are exported, preservation is **URL- and content-conservative**.

---

## 2. Assets that must be preserved

| Asset | Why | Preservation method |
|---|---|---|
| `/date-converter` | Converter intent + reported ranking | KEEP URL, KEEP tool, UPGRADE copy |
| `/hijri-calendar` | Umm Al-Qura 1448 queries | KEEP URL |
| `/today` | “التاريخ اليوم” | KEEP URL; title may stay date-dynamic |
| `/salaries` | Payday intent | KEEP URL |
| `/school-calendar` | School year queries | KEEP URL |
| `/holidays` | Holidays 2026/2027 | KEEP URL |
| `/countdown` + 18 slugs | “كم باقي على” | KEEP URL pattern |
| `/age-calculator` | Tool intent | KEEP URL |
| `/articles/*` (7) | Long-form + sources | KEEP slugs |
| `/gold-price` + 21 countries | Built indexable set | KEEP URL |
| `/usd-rate` + 21 countries | Built indexable set | KEEP URL |
| Canonical host `https://alshafra.com` | Domain entity | No www split; no trailing slash |
| `ads.txt` | AdSense | KEEP |
| IndexNow key file | Bing | KEEP path |
| 410 for old tech URLs | Drop old identity | KEEP 410 (implement on actual host) |
| robots.txt allow-all except `/index.html` | Lets Google see 410 | KEEP this philosophy |

---

## 3. URL preservation policy

**KEEP EXISTING URL WHENEVER REASONABLE.**

| Situation | Action |
|---|---|
| Published URL, any SEO or user value | Keep path |
| Unpublished but linked in nav (`/name-decoration`) | Keep path, add to sitemap only after prerender/quality |
| Catalog URL never published | Do not invent a new public URL until quality-ready |
| Old tech site URL | 410, not 301 to homepage |
| Trailing slash | 301 to non-slash (already intended) |
| `/index.html` | 301 to `/` |

Changing a URL requires a row in the redirect register:

```
OLD URL | NEW URL | REASON | 301 REQUIRED | CANONICAL TARGET | SEO RISK | MIGRATION PLAN
```

**No such 301 is approved in Phase 0 for the 127 published URLs.**

Internal type changes (article → guide in CMS) **must not** change the public path.

---

## 4. Canonical rules (current → future)

| Page class | Canonical |
|---|---|
| Every public document | Self-canonical absolute `https://alshafra.com{path}` |
| Pagination (future) | Self + rel next/prev; no canonical-to-page-1 unless duplicate |
| UGC failing quality gate | `noindex,follow` and **not** in sitemap |
| SPA shell / preview | `noindex` |
| Parameters (`?utm`, tool state) | Strip; canonical without query |
| `/articles` vs `/articles/slug` | Distinct |
| `/gold-price` vs `/gold-price/saudi-arabia` | Distinct |
| Arabic vs `/{lang}` | Distinct documents; hreflang only when true equivalents exist |

**Do not** repeat the historical bug where every page canonicalized to `/`.

---

## 5. Index / noindex policy

### Index (default for editorial + qualified tools)

- Core Saudi tools and guides.
- Reviewed articles.
- Countdown pages with real dates.
- Gold/USD pages that have unique country data **and** unique explanatory copy.
- Legal pages (low priority but indexable).

### Noindex

- Admin, drafts, previews, search result pages, tag pages thinner than threshold.
- UGC until quality gate (see `16-community-architecture.md`).
- Thin programmatic pages, placeholders, language hubs without unique content.
- 404/410 templates.
- `/trending/today` **if** it becomes a raw Trends list without added value (decision after GSC data).
- Parameter and duplicate sort orders.

Robots meta on qualified public pages:

`index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1`

---

## 6. Sitemap strategy

**Now:** single `sitemap.xml` emitted from prerender route table.

**Target:** sitemap index

```
/sitemap.xml                  → index
/sitemaps/core.xml            → home, tools, legal
/sitemaps/articles.xml
/sitemaps/tools.xml           → countdowns, gold, usd, calculators
/sitemaps/guides.xml          → /trending/* until/unless paths change (they should not)
/sitemaps/ugc.xml             → only indexed UGC
```

Rules:

- Sitemap contains only **200 + indexable** URLs.
- `lastmod` = content `updated_at` / review date, **not** every build (already partially implemented).
- Daily lastmod only for truly daily pages (`/today`, prices hubs).
- Do not include 410/404.
- Ping IndexNow for URLs whose lastmod actually changed.

---

## 7. Redirect & ghost URL strategy

### 7.1 Previous incarnation

| Pattern | Target | Status code |
|---|---|---|
| `/category/*` | gone | **410** |
| `/languages/*` | gone | **410** |
| `/news/*` | gone | **410** |
| `/index.html` | `/` | **301** |

Do **not** 301 old tech URLs to the homepage (that transfers irrelevant identity). Do **not** `Disallow` them in robots.txt (that freezes them in the index).

### 7.2 Host gap

410 is configured in `netlify.toml` and `public/_redirects`. `vercel.json` currently only 301s `/index.html`.

**Migration task (Phase 1 ops, not a URL change):** implement the same 410 rules on whichever host is actually serving `alshafra.com`. Prefer Cloudflare Redirects / Bulk Redirects in the target architecture.

### 7.3 Future necessary moves

None approved. Candidates that would **still keep old URL** via rewrite, not redirect:

- CMS type rename (`trending` → `guide`) behind the same path.

---

## 8. Homepage intent change (accepted risk)

The homepage **will** change from “Saudi calendar portal” to “Alshafra platform”.

| Risk | Mitigation |
|---|---|
| Query “تقويم السعودية” mismatch | Keep visible calendar entry points above the fold; keep Organization `alternateName` |
| Dilution of payday/Hijri intent | Do not move those intents to new URLs; hub them from homepage |
| Title rewrite losing CTR | Change title only with a staged experiment; inner pages keep calendar titles until cluster is stable |
| Internal link loss | Homepage must still link to all 127 core assets or their hubs |

See `54-homepage-migration.md`.

---

## 9. Structured data preservation

Keep and extend, do not reset:

| Type | Where |
|---|---|
| `WebSite` + `Organization` | Sitewide (update name to Alshafra **with** `alternateName`: تقويم السعودية) |
| `WebApplication` | Tools |
| `Article` + `FAQPage` | Articles and qualified guides |
| `ItemList` | Hubs |
| `BreadcrumbList` | All inner pages |
| `AboutPage` / `ContactPage` | Legal |

Add later: `Speakable` no; `Event` for holidays/countdowns (carefully, dates must be exact); `Dataset` no.

Never emit two competing JSON-LD graphs that overwrite one id (legacy bug).

---

## 10. Internal linking preservation

Current strengths:

- Header/footer `<a href>` (not buttons).
- Prerender related-links block.
- Countdown `related` slugs.
- Article list on homepage.

Rules going forward:

- Every preserved URL must keep ≥1 inbound link from a crawlable hub.
- Do not orphan countdown pages when the homepage is redesigned.
- Calendar cluster remains a first-class nav group, not a footer-only relic.

---

## 11. Programmatic SEO brake

The catalog and trending engines were designed to publish many pages/day.

**Preservation does not mean continuing that rate.**

Index a programmatic URL only if **all** are true:

1. Unique primary entity (a country, a named event, a distinct tool).
2. Unique data or unique editorial explanation (not only padded boilerplate).
3. Visible word count from unique content ≥ quality threshold (see `21-seo-architecture.md`).
4. At least one inbound link from a relevant hub.
5. Accurate, sourced, and dated.

Otherwise: generate privately, `noindex`, exclude from sitemap.

---

## 12. Monitoring after any launch that touches HTML

Weekly (human + Search Console, once connected):

- Indexed vs submitted.
- Coverage: 410 vs 404 vs 200.
- Query groups: hijri, converter, salaries, holidays, school.
- Sudden title/H1 rewrites.
- Cannibalization between `/salaries` and `/articles/salary-dates-saudi-arabia` (allowed if they differ: tool vs guide).

If a preserved URL loses impressions after homepage redesign, **do not** immediately 301 anything. First restore internal links and title.

---

## 13. Explicit non-actions

- No mass `/tool/` prefixing of existing tools.
- No slug translation of `/date-converter` to `/tahweel-altarikh`.
- No merging `/articles/hijri-calendar-1448` into `/hijri-calendar` via 301.
- No hreflang to unpublished language copies.
