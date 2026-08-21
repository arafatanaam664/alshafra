# 29 — Moderation

## Surfaces

Reports, spam queue, user restrictions (rate, no-links, read-only), ban, suspension, link allow/deny, audit logs.

## Queue

`moderation_items`: target type/id, reason, reporter, state.

Mods can hide, restore, warn, suspend, ban.

## Anti-spam (with Security)

- Rate limits
- Cloudflare Turnstile on register/post
- Reputation
- New-user limits
- Link restrictions
- Duplicate detection
- Velocity / similar-body detection

## Editorial vs UGC

Editorial is not “moderated” via this queue; it uses CMS review. Mods cannot silently rewrite articles (Editors do).

## Audit

Every destructive action logged (actor, before, after). Super Admin can see; logs retained (see DR).
