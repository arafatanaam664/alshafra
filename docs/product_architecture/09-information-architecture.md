# 09 — Information Architecture

## Principle

**Build once, activate later.**  
**Existing URLs have priority over a pretty taxonomy.**  
**Eight pillars are in scope** (`56-eight-pillars.md`); only flagged-on sections appear in the public nav.

---

## 1. Target sections (capability, not launch)

| # | Section (AR) | Flag (example) | Launch |
|---|---|---|---|
| 1 | الحلول | `solutions_enabled` | Phase 1–2 |
| 2 | الأدوات | `tools_enabled` | **On** (legacy) |
| 3 | المعلومات العملية | (editorial) | **On** |
| 4 | التقنية | `tech_enabled` | Phase 2 |
| 5 | التطبيقات والخدمات الرقمية | `services_enabled` | Phase 2 |
| 6 | الذكاء الاصطناعي | `ai_enabled` | Phase 2 content, not AI-core |
| 7 | التقاويم والمواعيد | `calendar_enabled` | **On** |
| 8 | التعليم | `education_enabled` | Partial (school calendar on) |
| 9 | الوظائف | `jobs_enabled` | Later |
| 10 | المنح | `scholarships_enabled` | Later |
| 11 | الفرص | `opportunities_enabled` | Later |
| 12 | المقارنات | `comparisons_enabled` | Later |
| 13 | السفر | `travel_enabled` | Later (trending travel exists) |
| 14 | الترندات | `trends_enabled` | Partial (`/trending` exists) |
| 15 | المجتمع | `community_enabled` | Later |

Flags are data, not hardcoded order.

---

## 2. Navigation (public, Phase 1 proposal)

**Brand:** Alshafra  

**Primary nav (desktop condensed + overflow):**

1. الرئيسية `/`
2. الحلول `/solutions` (if flag)
3. الأدوات `/tools` **and** legacy tools remain at old paths
4. المواعيد والتقويم → mega: `/today` `/date-converter` `/hijri-calendar` `/school-calendar` `/holidays` `/salaries` `/countdown`
5. أدلة `/articles` + `/trending` (labeled أدلة, not “ترند” only)
6. الذهب والعملات `/gold-price` `/usd-rate`
7. المجتمع `/questions` (if flag)
8. بحث

**Do not** move those mega-menu targets.

A tools hub at `/adawat` or `/tools` may exist as an index. It must **link out** to legacy paths, not replace them.

---

## 3. Sitemap of user-facing types

```
/                         Home (new identity)
/solutions/:slug          Solution (new)
/guide/:slug              Guide (new only)
/articles/:slug           KEEP legacy articles
/trending/:slug           KEEP existing guides
/tool/:slug               new tools only
/date-converter           KEEP
…                         (see 40-url-architecture.md)
/question/:id/:slug       Community (flag)
/category/:slug
/tag/:slug
/user/:handle
/about /contact /privacy /terms
```

---

## 4. Embedding the calendar cluster

The cluster is one **hub in IA**, implemented as:

- Nav group **المواعيد والتقويم**
- Homepage module **المواعيد اليوم في السعودية**
- Topic cluster internally: `topic:saudi-calendar`
- Shared breadcrumb root: الرئيسية › المواعيد والتقويم › …

Visual design: same Alshafra chrome. No second logo “تقويم السعودية” as a different site; it can appear as a **pillar badge**.

---

## 5. Taxonomy

- **Section** — top IA (calendar, tools, solutions, …)
- **Category** — editorial grouping
- **Topic** — cluster for linking/SEO (saudi-salaries, umm-al-qura, gold-ar, …)
- **Tag** — freeform, noindex if thin
- **Entity** — Tool, Event, Country, Program (Citizen Account, …)

A URL is owned by one canonical Section. It may belong to many Topics.

---

## 6. Activation

IA includes empty sections as **routable but flagged**:

- Flag off → URL 404 (not a thin “coming soon” indexed page), except if we already published a URL in that space (`/trending/travel` already exists — keep it).

Never reserve thousands of empty `/job/*` URLs.
