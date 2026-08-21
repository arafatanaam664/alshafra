# 13 — User Journeys

## J1 — Search to payday (legacy, must not break)

1. Query “متى ينزل حساب المواطن”.
2. Land `/salaries` or article or `/countdown/citizen-account`.
3. See next date (weekend-adjusted), Hijri equivalent, countdown.
4. Optional: related article, official source link.
5. Share/copy date.

**Analytics:** `page_view`, `tool_used`, `share`.

## J2 — Convert a document date

1. Query “تحويل التاريخ أم القرى”.
2. `/date-converter`.
3. Enter Hijri or Gregorian, see weekday, copy.
4. Related: `/today`, conversion article.

## J3 — New homepage exploration

1. Land `/` as Alshafra.
2. See platform identity + **clear** calendar module.
3. Choose Solutions / Tools / Calendar / Guides.
4. Must reach `/date-converter` in ≤2 clicks.

## J4 — Editor publishes a guide

1. CMS: idea → draft → review.
2. SEO fields + OG image.
3. Schedule.
4. Job: static revalidate, sitemap, IndexNow.
5. If `social_auto_publish_enabled` and rules match: enqueue social jobs (isolated).

## J5 — Ask a question (flag off until ready)

1. User signs in.
2. Duplicate search before create.
3. Question created `noindex`.
4. Answers accumulate.
5. Quality gate may flip `index` (SEO Manager policy + automation).

## J6 — Moderation

1. Visitor reports spam.
2. Moderator queue.
3. Hide content, restrict user, audit log.

## J7 — Social failure

1. Article published successfully.
2. Facebook job fails, Telegram succeeds.
3. Article stays published; Facebook job retry; no duplicate Telegram (idempotency key).
