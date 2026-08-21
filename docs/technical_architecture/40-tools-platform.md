# 40 — Tools Platform (technical)

`tools` row per tool. **path is the public URL.**

## Legacy tool definitions (seed)

| key | path | engine_key | runtime | data_mode |
|---|---|---|---|---|
| date-converter | `/date-converter` | `calendar.hijri_convert` | island | client_compute |
| hijri-calendar | `/hijri-calendar` | `calendar.month` | island | client_compute |
| today | `/today` | `calendar.today_riyadh` | island | client_compute |
| age-calculator | `/age-calculator` | `calendar.age` | island | client_compute |
| salaries | `/salaries` | `gov.salary_next` | island | client_compute |
| school-calendar | `/school-calendar` | `calendar.school` | static | none |
| holidays | `/holidays` | `calendar.holidays` | static | none |
| countdown | `/countdown/:slug` | `calendar.countdown` | island | client_compute |
| gold-price | `/gold-price/:country?` | `market.gold_gram` | island | build_snapshot |
| usd-rate | `/usd-rate/:country?` | `market.usd_rate` | island | build_snapshot |
| name-decoration | `/name-decoration/:slug?` | `text.decorate` | island | none |

Future tools register a new `path` that **does not collide**. New generic tools: `/tool/:slug`.

Adding a tool: insert row + engine in `packages/tools` + Astro page + island + SEO document `tool_page`. Quality before index.

Placeholders (`tool-placeholder` catalog) are **not** seeded as indexable tools.
