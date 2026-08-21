# 21 — Risk Register

| Risk | Mitigation |
|---|---|
| Dual source (JSON + DB) drift | Import is the ETL; Astro default still renders legacy HTML; parity test |
| PGlite ≠ Supabase | Portable SQL; auth.uid stubbed only if missing |
| Free-tier 500MB / pause | No PITR; dump later; heartbeat later |
| Service role in browser | assertNotBrowserService + boundary scan |
| Accidental URL change | published.json + routes unique path + 127 tests |
| Invented analytics | metrics default 0; no seed traffic |
| Schema too wide | Community/social tables exist but flags off; no UI |
