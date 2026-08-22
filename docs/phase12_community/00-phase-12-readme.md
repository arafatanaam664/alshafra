# Phase 12 — Community engine (flags off)

Architecture is live so the owner can turn community on later **without a rewrite**. Public writes return **404** while `community_enabled` / `questions_enabled` / `comments_enabled` stay false.

## Shipped

- `@alshafra/community`: questions, answers, votes, reports, hide/restore
- Path `/question/{uuid}/{slug}` — slug mismatch can 301; never under `/articles` or the 410 prefixes
- UGC robots `noindex, follow`; `seo.ugc_auto_index` still false → never auto-index
- Duplicate title check (Arabic normalization)
- New-user link ban + hourly rate limits
- Turnstile on writes (dev token `dev-ok` only when secret is empty and env ≠ production)
- Admin `/community` moderation queue
- No public `/questions` hub, no Astro UGC pages (site stays static)

## Still off

`community_enabled`, `questions_enabled`, `comments_enabled`, `registration_enabled`.  
Public signup stays 501 until Supabase Auth. Social OAuth publishing is not this phase.

## Owner later

Turnstile keys + flip flags only after moderation is staffed. See `01-owner-turnstile.md`.
