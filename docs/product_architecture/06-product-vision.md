# 06 — Product Vision

## Vision

**Alshafra** is an Arabic, RTL-first platform that helps a person:

- solve a practical problem,
- find a trustworthy piece of information,
- complete a task with a tool,
- know a date or a deadline,
- convert a value,
- understand a digital or government service,
- ask a question and get an answer,
- discover related content,
- share what helped them.

Alshafra is **not** a blog, **not** a news site, **not** a forum, **not** a tools dump.

It is **one platform that includes all eight locked pillars** (seven ideas from the reference chat + the live calendar site):

1. حلول ومعلومات عملية
2. أدوات + محتوى
3. دليل تقني للمشاكل والحلول
4. وظائف ومنح وفرص
5. ترندات وأسئلة الجمهور
6. سفر وأماكن وتجارب
7. مقارنة منتجات وخدمات
8. التقويم والمواعيد (الموقع الحي — تقويم السعودية as a section)

See `56-eight-pillars.md`. Architecture now. Content per pillar when it is good.

It is:

**CONTENT + TOOLS + SOLUTIONS + COMMUNITY + DISTRIBUTION**

## Brand

| Field | Value |
|---|---|
| Product name | Alshafra (الشفرة) |
| Domain | alshafra.com |
| Primary language | Arabic |
| Direction | RTL-first, i18n-ready |
| Current live name | تقويم السعودية (legacy surface name) |

The calendar cluster is **pillar 8**, not the whole company name. During transition, the platform can say:

> Alshafra — منصة عربية للمعلومات العملية والأدوات والحلول  
> ويتضمن قسم المواعيد والتقويم (تقويم السعودية): أم القرى، الرواتب، الإجازات، الدراسة

Final public wording is a **human decision** (see `49-phase-1-readiness.md`).

## What success looks like (qualitative)

A user arriving from “تحويل التاريخ أم القرى” still lands on `/date-converter` and trusts the number.

A user arriving from a generic “كيف …” query lands on a **Solution** or **Guide**, can run a **Tool** if one exists, and can ask a **Question** when the article is not enough.

Editors can publish without a deploy of JSON files.

Nothing valuable from the 127 URLs is 404.

## Positioning

| We are | We are not |
|---|---|
| Practical Arabic reference | Breaking newsroom |
| Tools with explanations | API-wrapper spam |
| Community with a quality gate | Unmoderated forum |
| Distribution via share + optional social publish | Growth-at-all-costs content mill |
| Saudi timing expertise as a beachhead | Only a Saudi calendar forever |

## Pillar story (legacy cluster inside the new whole)

```
Calendar (تقويم السعودية pillar)
  Hijri · Gregorian · Conversion · Today
  Saudi calendar · School · Holidays · Salaries · Countdowns
        ↓
  Government & digital services
        ↓
  Solutions · Tools · Guides
        ↓
  Technology · AI · Education · Opportunities · Community
```

One design system, one nav, one brand. The user should not feel they entered “a different website” when they open `/date-converter` from an AI guide.

## Geographic stance

- **Phase 1 public default:** Arabic, Saudi/Gulf practical context where the data is Saudi.
- **Architecture:** country and language as dimensions, not copies of the whole site.
- Do not pretend 16 equally good languages exist. They do not, today.

## Trust stance (YMYL)

Salaries, benefits, holidays, and religious dates are **Your Money or Your Life** adjacent.

- Cite official sources.
- Show last reviewed date.
- Prefer “according to X as of date” over fake precision.
- Moon sighting and ministry circulars override arithmetic when they conflict; the UI must say so.
