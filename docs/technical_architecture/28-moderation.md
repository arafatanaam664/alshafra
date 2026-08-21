# 28 — Moderation

`reports` + `moderation_actions` append. Mods: hide UGC, suspend (`users.status`), ban, remove links.

New-user: no links, rate limits, Turnstile. Duplicate detector: normalized title similarity (pg_trgm or app) before insert.

Editorial content is **not** in this queue (CMS review). Mods cannot PATCH documents.

Audit every action.
