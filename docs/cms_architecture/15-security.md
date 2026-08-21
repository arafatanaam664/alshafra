# 15 — Security

- Service role / PGlite only on server (`apps/admin/server`, `@alshafra/cms`)
- HttpOnly session cookie
- Zod/SQL constraints
- HTML sanitizer strips script/iframe/javascript:/handlers
- CSRF: SameSite=Lax cookie; JSON API same-origin
- Boundary scan flags service role in `apps/admin/src`
