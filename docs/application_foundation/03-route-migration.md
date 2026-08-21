# 03 — Route Migration Matrix

Astro `getStaticPaths` from LegacyContentProvider. Titles for inner pages come from `published.json` (SEO parity). `/` is TRANSFORM (Alshafra homepage).

| Legacy URL | Astro route | Rendering | Data source | Status | SEO | Test |
|---|---|---|---|---|---|---|
| / | src/pages/index.astro | SSG HTML | homepage TRANSFORM | migrated | new title (H1 brand) | PASS |
| /salaries | src/pages/[...slug].astro | SSG + optional island | calendar + core-guides | migrated | title from published.json | PASS |
| /hijri-calendar | src/pages/[...slug].astro | SSG + optional island | calendar + core-guides | migrated | title from published.json | PASS |
| /school-calendar | src/pages/[...slug].astro | SSG HTML | core-guides / JSON | migrated | title from published.json | PASS |
| /holidays | src/pages/[...slug].astro | SSG HTML | core-guides / JSON | migrated | title from published.json | PASS |
| /date-converter | src/pages/[...slug].astro | SSG + React island | core-guides + calendar | migrated | title from published.json | PASS |
| /age-calculator | src/pages/[...slug].astro | SSG + React island | core-guides + calendar | migrated | title from published.json | PASS |
| /articles | src/pages/[...slug].astro | SSG HTML | core-guides / JSON | migrated | title from published.json | PASS |
| /articles/salary-dates-saudi-arabia | src/pages/[...slug].astro | SSG HTML | articles.json | migrated | title from published.json | PASS |
| /articles/citizen-account-payment-dates | src/pages/[...slug].astro | SSG HTML | articles.json | migrated | title from published.json | PASS |
| /articles/hijri-calendar-1448 | src/pages/[...slug].astro | SSG HTML | articles.json | migrated | title from published.json | PASS |
| /articles/school-calendar-1448 | src/pages/[...slug].astro | SSG HTML | articles.json | migrated | title from published.json | PASS |
| /articles/official-holidays-saudi-arabia | src/pages/[...slug].astro | SSG HTML | articles.json | migrated | title from published.json | PASS |
| /articles/hijri-to-gregorian-conversion | src/pages/[...slug].astro | SSG HTML | articles.json | migrated | title from published.json | PASS |
| /articles/developed-social-security | src/pages/[...slug].astro | SSG HTML | articles.json | migrated | title from published.json | PASS |
| /countdown | src/pages/[...slug].astro | SSG HTML | core-guides / JSON | migrated | title from published.json | PASS |
| /countdown/national-day | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/founding-day | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/ramadan | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/eid-fitr | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/eid-adha | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/laylat-alqadr | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/hijri-new-year | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/citizen-account | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/employee-salaries | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/retiree-salaries | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/social-security | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/school-start | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/fall-break | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/midyear-break | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/school-end | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/new-year | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/suhail | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /countdown/murabbaniya | src/pages/[...slug].astro | SSG + countdown island | countdowns.json + calendar | migrated | title from published.json | PASS |
| /today | src/pages/[...slug].astro | SSG + optional island | calendar + core-guides | migrated | title from published.json | PASS |
| /faq | src/pages/[...slug].astro | SSG HTML | core-guides / JSON | migrated | title from published.json | PASS |
| /about | src/pages/[...slug].astro | SSG HTML | core-guides / JSON | migrated | title from published.json | PASS |
| /contact | src/pages/[...slug].astro | SSG HTML | core-guides / JSON | migrated | title from published.json | PASS |
| /privacy | src/pages/[...slug].astro | SSG HTML | core-guides / JSON | migrated | title from published.json | PASS |
| /terms | src/pages/[...slug].astro | SSG HTML | core-guides / JSON | migrated | title from published.json | PASS |
| /trending | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/today | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/economy | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/technology | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/social | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/education | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/religion | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/travel | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/dollar-exchange-rate-gulf | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/gold-price-gulf | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/crypto-investing-gulf | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/remittances-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/ai-future-jobs-gulf | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/gcc-tech-apps-2026 | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/smartphone-trends-gcc | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/gcc-savings-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/gulf-tax-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/citizen-support-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/gcc-education-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/gcc-school-calendar-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/ramadan-timetable-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/gulf-hajj-umrah-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/gulf-visa-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/gcc-travel-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/oil-price-gulf | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/real-estate-gulf | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/ecommerce-gulf | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/ai-tools-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/cybersecurity-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/family-budget-gulf | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/online-courses-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/prayer-times-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/zakah-calculator-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/saudi-tourism-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/social-media-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/jobs-career-gulf | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/car-owning-gulf | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/insurance-guide-gulf | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/student-guide-gulf | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/quran-ramadan-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/gulf-cuisine-guide | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/digital-banking-gulf | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /trending/freelancing-gulf | src/pages/[...slug].astro | SSG HTML | trending.json | migrated | title from published.json | PASS |
| /gold-price | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/egypt | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/egypt | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/sudan | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/sudan | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/algeria | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/algeria | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/iraq | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/iraq | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/morocco | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/morocco | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/saudi-arabia | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/saudi-arabia | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/yemen | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/yemen | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/syria | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/syria | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/tunisia | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/tunisia | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/jordan | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/jordan | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/uae | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/uae | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/libya | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/libya | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/lebanon | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/lebanon | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/palestine | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/palestine | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/mauritania | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/mauritania | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/oman | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/oman | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/kuwait | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/kuwait | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/qatar | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/qatar | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/bahrain | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/bahrain | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/djibouti | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/djibouti | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /gold-price/comoros | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
| /usd-rate/comoros | src/pages/[...slug].astro | SSG HTML | prices.json + countries | migrated | title from published.json | PASS |
