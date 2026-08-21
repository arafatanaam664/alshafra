# 09 — Content Domain

## Shared vs type-specific

**Shared (columns on `documents` + `document_seo`):** title, slug, path, excerpt, body_json, status, author, featured_media, category, tags, topics, dates, SEO, schema, ads, indexable.

**Type-specific (`type_data_json` + Zod per type):**

| Type | type_data_json |
|---|---|
| article | `{ read_minutes?: number }` |
| guide | `{ audience?: string }` |
| solution | `{ problem, steps[], prerequisites[], tool_ids[] }` |
| news | `{ happens_at?: string }` |
| trend | `{ snapshot_date?: string, source?: string }` |
| faq_page | faqs live in `faq_items` |
| comparison | `{ items[], criteria[] }` |
| opportunity/job/scholarship | `{ geo, eligibility, opens_at, closes_at }` |
| tool_page | `{ tool_id }` (also `tools.document_id`) |
| calendar_content | `{ calendar_system: 'umm_al_qura', timezone: 'Asia/Riyadh' }` |
| collection | `{ member_handler: 'articles' \| 'countdown' \| 'trending' }` |
| legal | `{ kind: 'privacy' \| ... }` |

Do not create `articles` / `guides` tables. Filters: `WHERE type = 'article'`.

## body_json blocks

`[{ "type": "p"|"h2"|"ul"|"table"|"faq"|"callout"|"tool_embed"|"source"|"image", ... }]`

Sanitized on write (Zod + HTML allowlist). `tool_embed` references `tools.id`.

## Path ownership

`documents.path` is the public URL. Legacy import sets path from old URL (`/articles/hijri-calendar-1448`). Slug may be `hijri-calendar-1448` while path is full.

## Indexable compute

```
indexable = status==published
  && deleted_at is null
  && (indexable_override ?? quality_pass)
  && robots in (index_follow, index_nofollow)
  && (feature_flag_key is null OR flag on)
```

UGC never uses this table.

## Mapping from Phase 0 JSON

See `63-content-migration-plan.md`.
