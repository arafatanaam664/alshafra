# 56 — Eight Pillars (locked 2026-08-21)

Owner decision: Alshafra is **one platform** that includes **all seven ideas** from the reference chat **plus** the live calendar site as the eighth idea.

This is not “pick a niche”. It is also not “launch eight empty websites tomorrow”.

**Broad architecture now. Activate content when it is good. Expand from data.**

---

## The eight ideas

| # | Idea (from the chat / live site) | Arabic nav label | Flag | Public today |
|---|---|---|---|---|
| 1 | منصة حلول ومعلومات عملية | الحلول | `solutions_enabled` | Off — types exist in CMS |
| 2 | موقع أدوات + محتوى | الأدوات | `tools_enabled` | **On** — converter, age, gold, USD, countdowns |
| 3 | دليل تقني للمشاكل والحلول | التقنية | `tech_enabled` | Off as a hub; some guides exist under `/trending` |
| 4 | وظائف ومنح وفرص | الفرص | `jobs_enabled` / `scholarships_enabled` / `opportunities_enabled` | Off |
| 5 | ترندات وأسئلة الجمهور | الترندات | `trends_enabled` (+ later `community_enabled`) | **Partial** — `/trending/*` live; Q&A off |
| 6 | سفر وأماكن وتجارب | السفر | `travel_enabled` | Off as a hub; existing `/trending/travel` URLs stay |
| 7 | مقارنة منتجات وخدمات | المقارنات | `comparisons_enabled` | Off |
| 8 | الموقع السابق: التقويم والمواعيد | المواعيد والتقويم | `calendar_enabled` | **On** — 127-URL beachhead |

Pillar 8 is the live site currently branded تقويم السعودية. It is a **section of Alshafra**, not a second product name. Schema `alternateName` may keep «تقويم السعودية».

---

## What “implement all eight” means

| We will | We will not |
|---|---|
| Keep types, flags, IA slots, CMS, and URL rules for every pillar | Index empty “coming soon” hubs |
| Ship calendar + existing tools without breaking URLs | Spray WhatsApp/PDF/jobs pages before quality + sources |
| Add new pillar pages through CMS + quality gate | Reuse `/category/*` `/languages/*` `/news/*` |
| Turn a pillar **on** when it has real pages | Turn a marketing flag on and 404 old URLs |
| Use search data (Bing/GSC) to choose the next cluster | Promise traffic or rankings |

---

## Mapping to content types

| Pillar | Primary types | Existing paths to keep |
|---|---|---|
| 1 Solutions | `solution`, `guide`, `faq_page`, `service_info` | none required yet |
| 2 Tools | `tool_page` + tool runtime | `/date-converter`, `/age-calculator`, `/gold-price`, `/usd-rate`, `/countdown/*` |
| 3 Tech troubleshooting | `solution`, `guide` bound to app/service **entities** | selected `/trending/*` |
| 4 Opportunities | `job`, `scholarship`, `opportunity` | none |
| 5 Trends + questions | `trend`, later UGC `Question`/`Answer` | `/trending`, `/trending/:slug` |
| 6 Travel | `guide`, later place entities | existing travel trending URLs only |
| 7 Comparisons | `comparison` | none |
| 8 Calendar | `calendar_content`, `tool_page`, `article` | `/`, `/today`, `/hijri-calendar`, `/salaries`, `/school-calendar`, `/holidays`, `/articles/*` |

Entities (WhatsApp, Umm Al-Qura, Citizen Account, …) bind types across pillars. A WhatsApp **entity** can have a solution, a guide, a comparison, and a tool without becoming a separate site.

---

## Activation order (content, not architecture)

Architecture for all eight is **in scope now**.

Recommended public activation (change only with new search evidence):

1. **Pillar 8** — already live. Preserve and upgrade.
2. **Pillar 2** — already live. Add tools only when the engine is real.
3. **Pillar 1 + 3** — first *new* editorial cluster after the CMS can publish HTML.
4. **Pillar 5** — upgrade existing `/trending` quality; Q&A only after moderation.
5. **Pillars 7, 4, 6** — later, data-driven, flags stay off until then.

This matches the chat strategy the owner already chose: full technical foundation, start where competition is lower and demand is proven (calendar/dates), then expand.

---

## Homepage

`/` may TRANSFORM to say Alshafra. It must speak to users, not to the internal eight-pillar plan.

- Calendar stays **unmissable** as a normal section, not as “the old site”.
- Unlaunched pillars are omitted. No “قريباً” engineering cards. No thin indexed hubs.
- Inner HIGH URLs do not move.
- Public copy never mentions phases, migration, Bing, or architecture.

See `54-homepage-migration.md`.

---

## Non-negotiables

1. One brand, one nav, one design system.
2. One modular monolith. No microservices. No HTTP between packages.
3. 127 published URLs stay 200 and self-canonical until a documented 301.
4. Quality gate before sitemap (unique text, sources on YMYL).
5. Community, social auto-publish, and AI assist stay flagged off until their milestones.
6. Do not delete Vite until an explicit Astro/Cloudflare cutover.
