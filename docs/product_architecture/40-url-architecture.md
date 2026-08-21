# 40 — URL Architecture

## Law

**Existing URLs have priority.** Do not change them to unify style.

## Preserved (non-exhaustive; full list in inventory)

`/`, `/date-converter`, `/hijri-calendar`, `/today`, `/salaries`, `/school-calendar`, `/holidays`, `/age-calculator`, `/countdown`, `/countdown/:slug`, `/articles`, `/articles/:slug`, `/faq`, `/about`, `/contact`, `/privacy`, `/terms`, `/gold-price`, `/gold-price/:country`, `/usd-rate`, `/usd-rate/:country`, `/trending`, `/trending/:slug`, `/trending/{categories}`, `/trending/today`

Also keep intended `/name-decoration` and children.

## New patterns (for **new** objects only)

| Pattern | Use |
|---|---|
| `/solution/:slug` | Solutions |
| `/tool/:slug` | New tools that do not already have a path |
| `/guide/:slug` | New guides (not migrated `/trending`) |
| `/question/:id/:slug` | Community |
| `/discussion/:id/:slug` | If distinct from Q&A |
| `/category/:slug` | Category hubs — **careful**: `/category/*` is 410 from old site. Prefer `/topics/:slug` or `/sections/:slug` **or** wait until 410 cluster is gone from the index. **Decision: do not reuse `/category/`.** |
| `/tag/:slug` | Tags |
| `/user/:handle` | Profiles |
| `/search` | Search |

## Collision notes

- `/category/*` is radioactive (old identity). **Never** reuse.
- `/languages/*` and `/news/*` same.
- `/articles` is Saudi editorial. World trivia must not occupy it (`/world/` was the catalog idea — still NO DECISION).
- Arabic tool slugs in `toolslugs.json` (`zakhrafa-nusus`, `adawat`, …) are unpublished; do not advertise until quality.

## Trailing slash

None. HTTPS only. Lowercase paths.

## 301 register

Empty for published URLs at Phase 0 close.
