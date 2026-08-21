# @alshafra/content

Editorial document types, block helpers, and the legacy JSON → Postgres import.

Public site rendering still uses the Astro `ContentProvider` with a **legacy HTML fallback**. The database holds the canonical documents/routes after `npm run data:import`.

Do not import `legacy-import.ts` from browser islands.
