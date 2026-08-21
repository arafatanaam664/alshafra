# 12 — Routes

`routes` is the Legacy Route Resolver (ADR-110): path, handler_kind, resource_type, resource_id, document_id, tool_id, http_status, is_legacy, canonical_url, status.

After import there are **127** active routes, 1:1 with `published.json`.

handler_kind: `document` | `tool` | `countdown` | `prices` | `static` | `gone` | `redirect`

Astro file routes still generate HTML. The table is the CMS-ready map so Phase 5 can manage 301/410 without deploys.

`redirects`: `/category/*`, `/languages/*`, `/news/*` → 410; `/index.html` → `/` 301.

Public `_redirects` in `apps/web/public` remains the edge implementation until a generator is added.
