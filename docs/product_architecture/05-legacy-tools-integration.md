# 05 — Legacy Tools Integration

Every tool discovered in code. “Future category” is the new IA bucket, not a new URL.

---

## 1. Inventory

| Tool | Current URL | Implementation | Data source | SEO value | User value | Future category | Upgrade |
|---|---|---|---|---|---|---|---|
| Date converter | `/date-converter` | `DateConverterPage.tsx` + `hijri.ts` | ICU Umm Al-Qura | **High** | **High** | Calendar / Tools | Keep URL; add copy/share, bidirectional validation, print; fix “approximate” copy |
| Hijri calendar | `/hijri-calendar` | `HijriCalendarPage.tsx` | `hijri.ts` + `events.ts` | **High** | **High** | Calendar | Month nav, print CSS, real PDF optional later |
| Today | `/today` | `TodayPage.tsx` | Riyadh today + countdowns | **High** | **High** | Calendar | Keep daily SSG; add “as of” timestamp |
| Age calculator | `/age-calculator` | `AgeCalculatorPage.tsx` | `hijri.ts` | Medium | High | Tools | Keep URL; add Hijri birth input already present — polish UX |
| Salaries | `/salaries` | `SalariesPage.tsx` + `events.ts` | `SALARY_SCHEDULES` + weekend rule | **High** | **High** | Calendar / Government services | Keep URL; do not explode into 60 thin month URLs unless each month has unique official confirmation |
| School calendar | `/school-calendar` | `SchoolCalendarPage.tsx` | Hardcoded 1448–1449 dates | **High** | **High** | Calendar / Education | Move dates to structured `CalendarEdition` entity |
| Holidays | `/holidays` | `HolidaysPage.tsx` | `SAUDI_EVENTS` | **High** | **High** | Calendar | Sector-aware tables |
| Countdown hub | `/countdown` | `CountdownPage.tsx` | `countdowns.json` | **High** | **High** | Calendar | Keep |
| Countdown item | `/countdown/:slug` | same + `countdowns.ts` | JSON schedule types | **High** | **High** | Calendar | Keep slugs; live tick is client-only |
| Gold hub | `/gold-price` | `GlobalPage` + catalog | `prices.json` | Medium | High | Tools / Practical info | Keep; show source + updated date; disclaimer |
| Gold country | `/gold-price/:country` | same | XAU/USD × FX × purity | Medium | High | Tools | Unique local notes; do not clone 185 countries until quality |
| USD hub | `/usd-rate` | same | `prices.json` rates | Medium | High | Tools | Keep |
| USD country | `/usd-rate/:country` | same | FX table | Medium | High | Tools | Keep AR 21 |
| Name decoration hub | `/name-decoration` | `NameDecorationPage.tsx` | `decoration.ts` Unicode styles | Low (unpublished) | Medium | Tools | **Prerender first**; then KEEP URL |
| Name decoration tools | `/name-decoration/{arabic,pubg,english,free-fire,french}` | same | Unicode maps | Low | Medium | Tools | Same |
| Catalog fancy text etc. | localized slugs | `GlobalPage` placeholders | i18n strings | None while placeholder | Low–Med | Tools | Do not index placeholders |
| Date-today country | `/date-today/:country` | catalog | country metadata | Unpublished | Low | Calendar | NO DECISION |
| FAQ | `/faq` | `FaqPage.tsx` | hardcoded + guides | Medium | Medium | Content | Become aggregated FAQ, still keep URL |

Housing support appears inside `/salaries` (day 24) but **not** as its own countdown slug. That is a product gap, not a URL to invent immediately.

---

## 2. Shared engines to extract as platform modules

These become **domain modules**, not React pages:

| Engine | File | Platform module |
|---|---|---|
| Umm Al-Qura conversion | `src/lib/hijri.ts` + `scripts/countdowns.mjs` | `Calendar` |
| Weekend payday rule | `applyWeekendRule` in `events.ts` | `Calendar` / `Tools` |
| Salary schedules | `SALARY_SCHEDULES` | `Tools` config + CMS |
| Countdown resolver | `countdowns.json` types | `Tools` |
| Price snapshot | `fetch-prices.mjs` | `Tools` job: `PriceSnapshotJob` |
| Unicode decoration | `decoration.ts` | `Tools` |

**Rule:** One engine, many surfaces (page, API later, PWA later). Do not reimplement Hijri in the CMS.

---

## 3. Tool platform mapping

Each legacy tool becomes a `Tool` entity:

```
Tool
  slug            # public path segment — LEGACY PATH WINS
  path            # full path
  module          # calendar | finance | text | utility
  runtime         # static | island (client JS)
  data_mode       # none | snapshot | live-client
  seo_mode        # index | noindex
  feature_flag    # tools_enabled already true for legacy
```

Interactive parts are **islands** (small JS). The surrounding article/guide stays static HTML.

---

## 4. Data-source risk

| Source | Risk | Mitigation |
|---|---|---|
| ICU Umm Al-Qura | Browser/Node calendar data differences | Build-time snapshot of month lengths for public HTML; client uses same algorithm |
| Ministry / GOSI / CA dates | Policy change | Editorial review calendar; never scrape unofficial blogs as source of truth |
| gold-api.com / open.er-api.com | Free, no SLA, indicative | Label as reference snapshot; store `source`, `fetched_at`; fail soft (already) |
| Google Trends RSS | Unofficial, ToS/availability | Optional widget; never the only content on a URL |

---

## 5. Integration into the new identity

Users should feel **one product**:

- Homepage: Alshafra
- Nav group **المواعيد والتقويم** contains the entire legacy cluster
- Tool pages keep their current titles that match search intent (e.g. “تحويل التاريخ… أم القرى”) even if the site name in the suffix becomes Alshafra
- Title pattern: `{Intent title} | Alshafra` with a **staged** suffix change (human approval). Until then, suffix may remain تقويم السعودية on this cluster to avoid unnecessary SERP churn.

---

## 6. Tools that should not launch as indexable clones

- Per-language copies of `/date-converter` (`/en/date-converter` etc.) until the page is a true localization, not a string-substituted shell.
- `/date-today/{country}` unless it shows timezone-correct local date **and** unique country calendar notes.
- Catalog password/word-counter pages while they are `tool-placeholder` HTML.

They remain in the architecture (`tools_enabled` families) and behind flags.
