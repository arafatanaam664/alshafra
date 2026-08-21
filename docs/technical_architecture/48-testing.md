# 48 — Testing Architecture

| Layer | What | Where |
|---|---|---|
| Unit | Calendar convert, weekend rule, Arabic normalize, quality gate | `packages/calendar`, `packages/domain` |
| Integration | publish → routes row + job insert | API + test DB |
| RLS | anon cannot read drafts | `supabase test` or SQL |
| API | contracts 22 | |
| E2E | Playwright HIGH URLs 200 | |
| SEO regression | below | |
| Upload | mime reject svg | |

## SEO / legacy regression (required)

For each URL in `62-legacy-route-regression-matrix.md` (127):

- status 200  
- canonical `https://alshafra.com{path}`  
- title non-empty, not homepage title (except `/`)  
- meta description  
- exactly one H1  
- robots index (until H6 exception)  
- JSON-LD parses  
- ≥1 internal `<a href>`  
- path listed in some sitemap  

410: `/category/artificial-intelligence` → 410.  
404: `/this-path-should-not-exist-xyz` → 404 not 200.  
No soft 404.

## AuthZ

Editor cannot `flags.toggle`. User cannot GET `/admin/documents`.

## Hijri fixtures

2026-06-16 ↔ 1448-01-01; weekend: Friday payday → Thursday.
