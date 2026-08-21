# 15 — CMS Architecture

The CMS is the editorial control plane. The public site remains **static-first**.

## Responsibilities

- CRUD for Editorial Content types in `10-content-model.md`
- Workflow: Idea → Draft → Review → Scheduled → Published → Updated → Archived / Unpublished
- SEO + social metadata
- Scheduling
- Revisions
- Media picker (R2)
- Related content (manual)
- Page-level ads and robots overrides
- Preview (noindex, auth)

## Out of scope

- UGC (Community module)
- Executing tools
- Storing OAuth tokens (Social module)

## Status machine

```
idea → draft → review → scheduled → published
                      ↘ draft
published → updated (still published) → unpublished → draft
published → archived (index policy: typically noindex or keep as historical year pages)
```

Permissions: Editor can draft and submit review. Admin/Editor-with-publish can publish. SEO Manager can edit SEO fields on published without changing body (or with). Super Admin can force.

## Fields (minimum)

Title, slug (locked after publish unless Super Admin), path (legacy-aware), excerpt, body (block editor), featured image, gallery, author, category, tags, topics, related (manual), SEO title/description/canonical/robots, OG, schema type, sources, FAQ, schedule_at, ads_enabled, indexable_override.

## Preview

`/preview/{token}` noindex, signed, expires. Does not enter sitemap.

## Publish side effects (via queue)

1. Persist revision.
2. Enqueue `content.index`
3. Enqueue `content.revalidate` (CDN)
4. Enqueue `sitemap.rebuild` (debounced)
5. Enqueue `indexnow.submit` if indexable
6. Emit `content.published` for Automation (social etc.)

Failure of 6 must not roll back 1–4.

## Body format

Portable blocks: paragraph, heading, list, table, FAQ, callout, tool_embed, official_source, image.

Tool embed references `tool_id` and renders the island on the public site.

## Multi-language

`locale` on content. Translations are related documents, not automatic clones. No hreflang until both sides exist and are indexable.

## Admin UI surfaces

List, editor, calendar of scheduled, bulk “review due” for year-bound pages (1448 etc.).
