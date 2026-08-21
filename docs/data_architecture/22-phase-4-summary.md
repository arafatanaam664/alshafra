# 22 — Phase 4 Summary

The data foundation exists as real SQL + a real import path, not TypeScript interfaces pretending to be a database.

Public HTML in Phase 4 still comes from the Astro legacy builder so SEO/HTML cannot regress. The database holds documents, routes, tools, SEO, flags, and zeros for metrics. Switch `ALSHAFRA_CONTENT_SOURCE=database` when a snapshot is present to overlay DB metadata.

Calendar package is untouched as a pure engine.

Stop here. Phase 5 (CMS UI) is a separate prompt.
