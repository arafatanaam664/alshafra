# 49 — Performance Budget

Justified from Phase 0 issues (Google Fonts, full SPA hydrate, 1Hz homepage) and 3G-ish Gulf mobile.

| Asset | Budget (gzip, HIGH article) | Why |
|---|---|---|
| HTML | ≤ 80 KB | content + crumbs, not 366 KB JS |
| CSS | ≤ 40 KB | one Tailwind sheet, purged |
| JS | ≤ 30 KB article; ≤ 80 KB tool | islands only |
| Fonts | ≤ 80 KB | 3 weights subset Arabic |
| LCP image | ≤ 50 KB | og not in LCP; hero CSS |
| Requests blocking | 0 webfonts from fonts.gstatic if self-host | |

Targets (lab, not promises): LCP < 2.5s, CLS < 0.1, INP < 200ms on article.

Homepage: **no 1s interval on layout**. Clock island isolated or static HH:MM from build.

CDN: HTML `max-age=0, s-maxage=3600, stale-while-revalidate=86400` except `/today` shorter (300s). Assets hashed immutable 1y.

Invalidate: purge path on publish job + home if linked.
