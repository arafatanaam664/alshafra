# 04 — Legacy Content Migration

Do **not** copy old content as-is into the new CMS without a verdict.

Verdicts: **KEEP | UPDATE | EXPAND | MERGE | REWRITE**

---

## 1. Decision criteria

| Verdict | When |
|---|---|
| KEEP | Factual, sourced, unique, still matches intent. Move into CMS with only mechanical mapping. |
| UPDATE | Correct facts, dates, weekend rules, sources, year tokens (1448/2026/2027). Keep structure. |
| EXPAND | Intent is right but depth, FAQs, tables, or internal links are insufficient. |
| MERGE | Two URLs target the same intent; keep the stronger URL; the other stays live as a complementary angle **or** later 301 only if data proves cannibalization. Phase 0 default: **keep both URLs**, unify internally. |
| REWRITE | Brand pages, homepage, about; or content whose voice is catalog-padding rather than expertise. |

Never REMOVE published editorial just because the CMS model is richer.

---

## 2. Editorial articles (7)

| URL | Verdict | Why |
|---|---|---|
| `/articles/salary-dates-saudi-arabia` | UPDATE + EXPAND | Core YMYL. Keep slug. Refresh tables each year; add month-by-month only if unique, not 12 thin clones. |
| `/articles/citizen-account-payment-dates` | UPDATE + EXPAND | High intent. Keep official source links. |
| `/articles/hijri-calendar-1448` | UPDATE | Year-bound. Plan 1449 successor **new URL** when needed; keep 1448 as archive/indexable year page. |
| `/articles/school-calendar-1448` | UPDATE | Must track Ministry of Education changes and two-semester system. |
| `/articles/official-holidays-saudi-arabia` | UPDATE + EXPAND | Strong Bing signal cluster. Keep sector distinctions (public/private/banks). |
| `/articles/hijri-to-gregorian-conversion` | UPDATE | Align copy with ICU Umm Al-Qura (remove “approximate algorithm” contradiction). |
| `/articles/developed-social-security` | UPDATE + EXPAND | YMYL. Eligibility rules change; needs review cadence. |

CMS mapping: `Article` or `Guide` type, category from current `salaries|calendar|holidays|tools|support`, `reviewedAt` becomes `reviewed_at`, sources become `Source` relations.

---

## 3. Core tool pages (body copy)

These pages mix **interactive UI** + **editorial asides** (`core-guides.json`).

| URL | Verdict |
|---|---|
| `/salaries` | UPDATE — keep payday engine; expand per-program sections without new URLs unless data demands |
| `/hijri-calendar` | UPDATE — fix PDF promise; print stylesheet instead of fake download if no file |
| `/school-calendar` | UPDATE |
| `/holidays` | UPDATE |
| `/date-converter` | UPDATE copy (engine is already Umm Al-Qura) |
| `/age-calculator` | UPDATE |
| `/today` | UPDATE — keep daily generation |
| `/countdown` and `/countdown/:slug` | UPDATE — keep JSON schedule model; move definitions into CMS or `ToolConfig` later without slug changes |
| `/faq` | EXPAND — generate from entity FAQs, not a disconnected page |
| `/gold-price`, `/usd-rate` + countries | UPDATE — unique country notes; reduce shared padding; keep disclaimer |
| `/trending/*` topics | UPDATE or MERGE (see below) — rewrite boilerplate tails |
| `/trending`, `/trending/{category}`, `/trending/today` | TRANSFORM in product role; UPDATE copy |

---

## 4. MERGE candidates (no 301 in Phase 0)

| Weaker / overlapping | Stronger sibling | Phase 0 action |
|---|---|---|
| `/trending/gold-price-gulf` | `/gold-price` | Keep both; cross-link; differentiate (Gulf investing guide vs live table) |
| `/trending/dollar-exchange-rate-gulf` | `/usd-rate` | Same |
| `/trending/gcc-school-calendar-guide` | `/school-calendar` | Gulf vs Saudi official calendar — keep both if intros stay distinct |
| `/trending/citizen-support-guide` | `/articles/citizen-account-payment-dates` + `/articles/developed-social-security` | Keep; add canonical only if duplication is proven |

If after 90 days GSC shows cannibalization, prefer **keeping the tool/article URL** and `noindex` or 301 the trending duplicate. That is a **future decision**.

---

## 5. Brand / legal

| URL | Verdict |
|---|---|
| `/` | REWRITE (new homepage) — see `54-homepage-migration.md` |
| `/about` | REWRITE for Alshafra, keep URL |
| `/contact` | UPDATE (add form later behind flag) |
| `/privacy` | UPDATE when auth/community/ads change |
| `/terms` | UPDATE when UGC exists |

---

## 6. Catalog / i18n / world articles

| Family | Verdict |
|---|---|
| 16 language hubs | NO PUBLISH until unique homepage-per-language exists. Do not migrate placeholders. |
| Fancy text / symbols / password / etc. | KEEP capability in Tools platform; do not migrate thin HTML. |
| `/world/*` trivia, riddles, dhikr | NO DECISION YET. High thin-content risk. |
| Names / letters lists | NO DECISION YET. |

---

## 7. Name decoration

KEEP the product idea and the intended URLs `/name-decoration` and five slugs. Content must be **prerendered** before it is treated as an SEO asset. Until then it is a UX debt, not a ranking asset.

---

## 8. Year-bound content rule

Pages that contain `1448` or `2026-2027` in the **slug** stay as year documents.

- Do **not** silently retitle a 1448 slug into 1449.
- Create a new slug for the new year.
- Hub pages (`/hijri-calendar`, `/school-calendar`) may update in place because the URL is not year-scoped.
- Add “updated on {date}” visible to users (already partially present).

---

## 9. Voice and trust

When moving into the CMS:

1. Keep official source blocks.
2. Keep the disclaimer: informational, not a government announcement; moon-sighting may differ by one day.
3. Drop catalog padding paragraphs that only exist to pass the 1500-word gate. Replace with real tables, worked examples, and sourced FAQs. **Quality is not word count.**
4. Align all public names to the approved brand (human decision) while keeping `تقويم السعودية` as `alternateName` if Alshafra is chosen.

---

## 10. Migration mechanics (conceptual — not Phase 1 schema)

```
JSON article / guide / countdown
  → Content entity (draft imported as published)
  → revision 1 = imported snapshot
  → editors UPDATE in CMS
  → static regenerate URL (same path)
```

Import must store `legacy_path`, `legacy_source_file`, `imported_at`.

Do not change slugs during import.
