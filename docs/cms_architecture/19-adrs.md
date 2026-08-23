# Phase 5 ADRs

## ADR-501 Permission aliases

Keep Phase 4 keys (`documents.*`). Map Phase 5 `content.*` names in `hasPermission`.

## ADR-502 Dev staff login

HMAC cookie + `ADMIN_DEV_LOGIN` only outside production. Supabase Auth remains the production adapter.

## ADR-503 In-process Admin API

`handleAdminApi` in `@alshafra/cms` is not a microservice. Vite middleware is a composition root.

## ADR-504 Platform sections contract

Sections are a catalog in `@alshafra/content` with overrides in `site_settings.platform.sections`. No new `sections` table in this correction. Locked paths cannot change. A section without `hasPublicPage` cannot be enabled for the public UI.
