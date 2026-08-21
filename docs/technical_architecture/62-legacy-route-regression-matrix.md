# 62 — Legacy Route Regression Matrix

Source: `public/published.json` (127 URLs, generatedAt in file). Expected production status **200** after cutover. Canonical = `https://alshafra.com` + path (no trailing slash).

| URL | Expected status | New handler | Kind | Canonical | Action | Migration status |
|---|---:|---|---|---|---|---|
| / | 200 | pages/index.astro | home | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /salaries | 200 | pages/salaries.astro | tool_calendar | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /hijri-calendar | 200 | pages/hijri-calendar.astro | tool_calendar | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /school-calendar | 200 | pages/school-calendar.astro | tool_calendar | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /holidays | 200 | pages/holidays.astro | tool_calendar | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /date-converter | 200 | pages/date-converter.astro | tool_island | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /age-calculator | 200 | pages/age-calculator.astro | tool_island | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /articles | 200 | pages/articles/index.astro | collection | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /articles/salary-dates-saudi-arabia | 200 | pages/articles/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /articles/citizen-account-payment-dates | 200 | pages/articles/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /articles/hijri-calendar-1448 | 200 | pages/articles/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /articles/school-calendar-1448 | 200 | pages/articles/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /articles/official-holidays-saudi-arabia | 200 | pages/articles/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /articles/hijri-to-gregorian-conversion | 200 | pages/articles/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /articles/developed-social-security | 200 | pages/articles/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown | 200 | pages/countdown/index.astro | collection | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/national-day | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/founding-day | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/ramadan | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/eid-fitr | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/eid-adha | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/laylat-alqadr | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/hijri-new-year | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/citizen-account | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/employee-salaries | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/retiree-salaries | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/social-security | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/school-start | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/fall-break | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/midyear-break | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/school-end | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/new-year | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/suhail | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /countdown/murabbaniya | 200 | pages/countdown/[slug].astro | tool_countdown | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /today | 200 | pages/today.astro | tool_calendar | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /faq | 200 | pages/faq.astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /about | 200 | pages/about.astro | legal | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /contact | 200 | pages/contact.astro | legal | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /privacy | 200 | pages/privacy.astro | legal | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /terms | 200 | pages/terms.astro | legal | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending | 200 | pages/trending/index.astro | collection | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/today | 200 | pages/trending/today.astro | trend_snapshot | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/economy | 200 | pages/trending/[category].astro | collection | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/technology | 200 | pages/trending/[category].astro | collection | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/social | 200 | pages/trending/[category].astro | collection | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/education | 200 | pages/trending/[category].astro | collection | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/religion | 200 | pages/trending/[category].astro | collection | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/travel | 200 | pages/trending/[category].astro | collection | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/dollar-exchange-rate-gulf | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/gold-price-gulf | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/crypto-investing-gulf | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/remittances-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/ai-future-jobs-gulf | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/gcc-tech-apps-2026 | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/smartphone-trends-gcc | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/gcc-savings-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/gulf-tax-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/citizen-support-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/gcc-education-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/gcc-school-calendar-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/ramadan-timetable-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/gulf-hajj-umrah-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/gulf-visa-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/gcc-travel-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/oil-price-gulf | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/real-estate-gulf | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/ecommerce-gulf | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/ai-tools-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/cybersecurity-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/family-budget-gulf | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/online-courses-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/prayer-times-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/zakah-calculator-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/saudi-tourism-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/social-media-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/jobs-career-gulf | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/car-owning-gulf | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/insurance-guide-gulf | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/student-guide-gulf | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/quran-ramadan-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/gulf-cuisine-guide | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/digital-banking-gulf | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /trending/freelancing-gulf | 200 | pages/trending/[slug].astro | document | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price | 200 | pages/gold-price/index.astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate | 200 | pages/usd-rate/index.astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/egypt | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/egypt | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/sudan | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/sudan | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/algeria | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/algeria | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/iraq | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/iraq | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/morocco | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/morocco | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/saudi-arabia | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/saudi-arabia | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/yemen | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/yemen | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/syria | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/syria | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/tunisia | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/tunisia | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/jordan | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/jordan | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/uae | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/uae | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/libya | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/libya | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/lebanon | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/lebanon | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/palestine | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/palestine | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/mauritania | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/mauritania | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/oman | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/oman | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/kuwait | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/kuwait | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/qatar | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/qatar | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/bahrain | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/bahrain | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/djibouti | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/djibouti | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /gold-price/comoros | 200 | pages/gold-price/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |
| /usd-rate/comoros | 200 | pages/usd-rate/[country].astro | tool_prices | self | KEEP+UPGRADE or TRANSFORM/MERGE per Phase 0 | not_migrated |

## Additional linked-but-unpublished (must not 500)

| URL | Expected status | New handler | Notes |
|---|---:|---|---|
| `/name-decoration` | 200 after prerender/import else unlink | `pages/name-decoration/index.astro` | Phase 0 KEEP+UPGRADE |
| `/name-decoration/arabic` | 200 after import else unlink | `pages/name-decoration/[slug].astro` | |
| `/name-decoration/pubg` | 200 after import else unlink | `pages/name-decoration/[slug].astro` | |
| `/name-decoration/english` | 200 after import else unlink | `pages/name-decoration/[slug].astro` | |
| `/name-decoration/free-fire` | 200 after import else unlink | `pages/name-decoration/[slug].astro` | |
| `/name-decoration/french` | 200 after import else unlink | `pages/name-decoration/[slug].astro` | |
| `/en` and other locales | 404 until quality | — | do not SPA-fallback |

## Ghost patterns

| Pattern | Expected status | Handler |
|---|---:|---|
| `/category/*` | 410 | Cloudflare `_redirects` / resolver |
| `/languages/*` | 410 | same |
| `/news/*` | 410 | same |
| `/index.html` | 301 | `/` |
| unknown | 404 | `pages/404.astro` |

