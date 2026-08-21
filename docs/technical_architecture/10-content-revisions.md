# 10 — Content Revisions

## Invariants

- Publish stores a revision and points `published_revision_id`.
- Autosave draft = new revision or update **draft working copy** on `documents.body_json` **plus** revision on explicit save/submit/publish.
- **Decision:** every **publish** and **restore** and **submit_review** inserts a revision. Drafts debounce to revisions every N minutes or on save button.
- Revisions are immutable snapshots: title, excerpt, body_json, type_data_json, seo_json.
- Restore copies snapshot into working document and inserts a new revision (`restored_from_version`).
- Compare: JSON/block diff in admin (Phase 2 UI).
- YMYL: changing `calendar_programs.day_of_month` writes audit + optional revision on the related tool_page.

## Table

`document_revisions(version int)` monotonic per document.

No DELETE. No UPDATE except correcting `author_user_id` never — freeze.

## Publish algorithm

1. Insert revision v+1  
2. Set status published, published_at if null, published_revision_id  
3. Recompute indexable  
4. Upsert `routes`  
5. Enqueue jobs (revalidate, search, sitemap, indexnow, event)

Failure after 2: jobs retry; document stays published (same as social isolation philosophy).
