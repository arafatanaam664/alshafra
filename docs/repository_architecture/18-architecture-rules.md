# 18 — Architecture Rules

**RULE-001:** No microservices.  
**RULE-002:** No direct database access from UI.  
**RULE-003:** No business logic in pages — calendar math is `@alshafra/calendar`.  
**RULE-004:** No deep imports (`@alshafra/*/src/...`).  
**RULE-005:** No circular package dependencies.  
**RULE-006:** No secrets in the repository.  
**RULE-007:** Packages have one owner (README).  
**RULE-008:** No generic `utils`/`types` package without ADR.  
**RULE-009:** Do not add a package without a boundary.  
**RULE-010:** Admin and web share domain packages; they do not duplicate Hijri.  
**RULE-011:** `tools/` is developer tooling; `packages/tools` is the product tool registry.  
**RULE-012:** Do not 200-fallback unknown URLs.  
**RULE-013:** Do not change the 127 published paths.  
**RULE-014:** Service role never in `apps/web/src`.
