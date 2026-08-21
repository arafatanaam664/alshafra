# 61 — Architecture Rules (mandatory)

1. UI does not access the database.  
2. Domain does not import UI.  
3. Social providers do not enter Content domain.  
4. Jobs orchestrate; they do not reimplement Hijri or payday rules.  
5. Secrets never plaintext in DB (only refs/ciphertext).  
6. Public UGC is not indexed automatically.  
7. Legacy URLs do not change without a `redirects` row + ADR.  
8. No SPA fallback to 200.  
9. No `/category/` reuse.  
10. No automatic ` | Alshafra` title suffix.  
11. Public brand string is Alshafra.  
12. Service role never in client bundles.  
13. Published HTML for articles must be readable with JS disabled.  
14. `path` stored with leading `/`, no trailing `/`.  
15. Timestamps UTC.  
16. Feature flags do not 404 existing indexed URLs.  
17. 410 for old tech prefixes, not 301 home.  
18. Zod at every write boundary.  
19. Idempotent social/publish jobs.  
20. Calendar package is the only Hijri implementation.
