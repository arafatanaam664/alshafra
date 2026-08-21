# 22 — Phase 2 Risks

| ID | Risk | Mitigation |
|---|---|---|
| P2-1 | Hosting still looks for root `dist/` | netlify publish + vercel outputDirectory updated |
| P2-2 | GH Action pathspec missing | workflow paths updated to `apps/web/...` |
| P2-3 | Duplicate Hijri implementations | only calendar package; web re-exports |
| P2-4 | Empty-package rot | matrix; postponed community/jobs |
| P2-5 | Astro delay | explicit ADR-203 |
| P2-6 | npm workspace install on old CI cache | Node 22, npm 10 |
