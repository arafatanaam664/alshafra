# 14 — Seed Strategy

`packages/database/src/seed.ts` is the seed. It is safe for development: **no fake people**, no production secrets.

Seeded: roles, permissions, role_permissions, content_types, categories (current families only), topics, entities (small set), author `Alshafra`, tool_categories, calendar_programs, feature_flags, site_settings keys, 410/301 redirects, empty ad_slot `in_article`.

Not seeded: the 127 documents (that is **import**, not seed).
