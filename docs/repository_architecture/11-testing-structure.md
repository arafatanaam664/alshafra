# 11 — Testing Structure

| Kind | Location |
|---|---|
| Unit (calendar) | future `packages/calendar/src/*.test.ts` — not required this phase |
| Legacy URL count | `tests/legacy/urls.mjs` |
| Boundaries | `tools/check-boundaries.mjs` |
| SEO/e2e 127 live | architecture ready; full HTTP suite waits for Phase 3+ host |

`npm test` = inventory + boundaries (fast). Not Playwright on every commit.
