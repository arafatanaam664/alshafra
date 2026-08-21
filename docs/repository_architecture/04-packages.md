# 04 — Packages

See `20-package-decision-matrix.md`.

Public entry: each package `src/index.ts` via `"exports": { ".": "./src/index.ts" }`.  
**Source consumed directly** (no `dist` build) — ADR-202.

Internal files live next to `index.ts`. Other packages import `@alshafra/<name>` only.
