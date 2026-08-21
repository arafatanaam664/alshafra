# 03 — Authentication

Target: Supabase Auth (`@alshafra/auth` port). Domain `users` + `user_roles`.

Development (non-production): `ADMIN_DEV_LOGIN=true` email login provisions a staff row and sets an HttpOnly HMAC cookie (`ADMIN_SESSION_SECRET`). Never enabled when `ALSHAFRA_ENV=production`.

Production without Supabase configured returns `501 supabase_auth_not_configured`.
