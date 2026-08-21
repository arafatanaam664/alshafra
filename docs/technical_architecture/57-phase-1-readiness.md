# 57 — Implementation Readiness

An engineer can implement, in order, **without new architecture debates**:

1. `supabase/migrations` from `05`+`06`+`07`  
2. Auth adapter + `users` provision  
3. `packages/calendar` port from `src/lib/hijri.ts`  
4. Astro `apps/web` with resolver + 410  
5. Document CMS API (not full UI)  
6. Tool pages as Astro+islands using `tools.path`  
7. SEO title/canonical/sitemap jobs  
8. Flags + settings  
9. Tests 48/62  

## Still human/ops (not blocking schema)

- DNS cutover date  
- H6 `/trending/today` index (default: stay index)  
- Verify free-tier on vendor dashboards  
- GSC/GA tokens  

## Phase 2 (next) — allowed to start after this doc set

Foundation code: Astro shell, migrations, calendar package, URL compatibility, import of 127. **Not** full CMS UI, community, social OAuth, 16 languages.

See `58` for out-of-scope.
