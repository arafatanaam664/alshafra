# Phase 5 ADRs

## ADR-501 Permission aliases

Keep Phase 4 keys (`documents.*`). Map Phase 5 `content.*` names in `hasPermission`.

## ADR-502 Dev staff login

HMAC cookie + `ADMIN_DEV_LOGIN` only outside production. Supabase Auth remains the production adapter.

## ADR-503 In-process Admin API

`handleAdminApi` in `@alshafra/cms` is not a microservice. Vite middleware is a composition root.
