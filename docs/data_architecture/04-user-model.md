# 04 — User Model

Supabase Auth owns identity (email/OAuth later). Domain table `users` has independent UUIDv7 `id` and nullable `auth_user_id`.

No passwords in `public`. No registration UI in Phase 4 (`registration_enabled` false).

`profiles` is 1:1 extras (bio, avatar_media_id, locale, timezone). `authors` is the **bylines** table (organization `Alshafra` is seeded) and is not the same as `users`.

Roles: `user`, `trusted_user`, `moderator`, `editor`, `seo_manager`, `social_manager`, `analyst`, `admin`, `super_admin`. Visitor is implicit (no row).
