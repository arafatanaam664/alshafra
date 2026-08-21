# 02 — Entity Model

Editorial supertype is **`documents`**. UGC uses separate tables (`questions`, `answers`, `comments`) so indexing/ads cannot leak.

Named real-world things live in **`entities`** (Phase 4) in addition to Phase 1 **`topics`** (editorial clusters).

```mermaid
erDiagram
  users ||--o| profiles : has
  users ||--o{ user_roles : granted
  roles ||--o{ user_roles : includes
  roles ||--o{ role_permissions : grants
  permissions ||--o{ role_permissions : on
  authors ||--o{ documents : byline
  categories ||--o{ documents : classifies
  documents ||--o{ document_revisions : versions
  documents ||--|| document_seo : seo
  documents ||--o{ document_tags : tagged
  tags ||--o{ document_tags : on
  documents ||--o{ document_topics : clustered
  topics ||--o{ document_topics : on
  documents ||--o{ document_entities : mentions
  entities ||--o{ document_entities : on
  documents ||--o{ document_relations : related
  documents ||--o{ faq_items : faqs
  sources ||--o{ document_sources : cited
  documents ||--o{ document_sources : cites
  documents ||--o| routes : published_as
  tools ||--o| documents : documented_by
  tools ||--o{ tool_settings : config
  media ||--o{ media_variants : variants
```

Conflict vs Phase 4 wording `content_versions` / `content_tags` / `seo_metadata`: Phase 1 names win (`document_revisions`, `document_tags`, `document_seo`). See ADR-404.
