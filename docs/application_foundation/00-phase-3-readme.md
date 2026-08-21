# Phase 3 — Application Foundation & Astro Migration

**Status:** COMPLETE (Astro verified for 127 routes; production deploy still Vite until explicit cutover)

- `apps/web` = **Astro 5** static + React islands  
- `apps/web-legacy` = Vite + prerender (**rollback / current GH production build**)  
- Content: `LegacyContentProvider` reading JSON from web-legacy  
- No CMS, DB, community, social, DNS changes
