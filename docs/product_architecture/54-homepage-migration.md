# 54 — Homepage Migration

## Current homepage (live)

- **URL:** `/` (KEEP)
- **Title:** تقويم السعودية | مواعيد الرواتب وحساب المواطن والتقويم الهجري والميلادي
- **H1:** مواعيد الرواتب، التقويم الهجري، والإجازات الرسمية في مكان واحد
- **Job:** Saudi calendar portal: today card, countdown, services grid, salary cards, articles
- **Canonical:** `https://alshafra.com/`
- **Indexable:** yes (prerendered)

## Problem

The product is becoming **Alshafra**, a wide Arabic platform. The homepage is the one URL we **are** allowed to redesign. Inner URLs are not.

## New homepage job

1. Declare Alshafra identity (after H1 decision).
2. Give a path to **solve / read / use a tool / see today’s dates** in one screen.
3. Keep the Saudi timing cluster **unmissable** (not a footer dump).
4. Preview Solutions, Tools, Technology/AI (even if some are “soon” **without** indexed empty states — hide if flag off).
5. Search entry.

## Information architecture of `/`

**Block A — Identity hero**  
Alshafra name + one-line promise (معلومات عملية، أدوات، حلول). Language: Arabic.

**Block B — Today in Saudi Arabia (legacy module)**  
Hijri + Gregorian + weekday + link `/today`. Next payday / next holiday chips linking to existing URLs.

**Block C — Start here**  
Four cards: تحويل التاريخ, مواعيد الرواتب, الأدوات, الأدلة. Links: `/date-converter`, `/salaries`, tools hub or `/countdown`, `/articles` + `/trending`.

**Block D — Solutions** (if flag) else omit.

**Block E — Tools strip**  
Existing services including gold/USD and name decoration **only if 200**.

**Block F — Guides**  
Mix of 7 articles + selected guides.

**Block G — Community teaser**  
Only if flag on.

**Block H — Trust**  
Independent, sources, not a government site.

## SEO for `/`

- Canonical stays `/`.
- H1 will change — accepted.
- Title: **human H1/H2**. Recommendation: keep calendar keywords in description even if title becomes Alshafra-first.
- JSON-LD WebSite name → Alshafra with `alternateName`: ["تقويم السعودية", "Saudi Calendar", "شفرة"].
- Internal links to all HIGH URLs must remain crawlable from `/` or from one click hubs linked on `/`.

## What not to do

- Do not 301 old homepage intent to `/calendar`.
- Do not remove salary/hijri links in the same release as a title change without SEO Manager.
- Do not show 16 flags that 404.

## Success check

From `/`, two clicks max to `/date-converter`, `/salaries`, `/hijri-calendar`, `/articles/hijri-to-gregorian-conversion`.
