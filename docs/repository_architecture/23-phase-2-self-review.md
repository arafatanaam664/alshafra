# 23 — Self Review

| Check | Result |
|---|---|
| Circular deps | none among packages |
| Duplicate Hijri | removed from events; calendar owns weekend rule |
| Empty packages | contracts have index.ts + README; community postponed |
| Business logic in UI | leftover in pages (legacy); new math not added there |
| DB leakage | no supabase client |
| Deep imports | checker |
| Legacy breakage | build 127 pages, 0 orphans |
| Over-engineering | no turbo, no astro yet, no zod dump |
| Duplicate eslint | one in apps/web |
| Phase 1 vs repo | Astro deferred, documented |

## Deleted files

None of the original product sources were deleted. `src/lib/hijri.ts` was replaced by a re-export after copy into the calendar package.
