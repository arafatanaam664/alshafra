# 14 — Readiness / Gates

| Gate | Result |
|---|---|
| 1 Astro build | PASS |
| 2 CF static compatible | PASS (no adapter needed) |
| 3 127 routes | PASS dist test |
| 4 Golden routes | PASS (subset of 127) |
| 5 no unexpected 404 in set | PASS |
| 6 no unexpected redirects | no 301 on 127 |
| 7 410 files present | PASS `_redirects` + 410.html |
| 8 Titles | PASS (published.json) |
| 9 Canonical | PASS |
| 10 Robots | PASS not noindex |
| 11 Content | PASS from JSON |
| 12 Calendar | PASS package |
| 13 Tools | PASS islands + guides |
| 14 cycles | none |
| 15 deep imports | checker |
| 16 typecheck | PASS |
| 17 lint | PASS (legacy warnings) |
| 18 tests | PASS |
| 19 build | PASS |
| 20 secrets | none |
| 21 no indexable empty placeholders | PASS |
| 22 no DNS change | PASS |
| 23 Vite fallback | PASS web-legacy |
