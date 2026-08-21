# 03 — Content Model

## documents

Path is the public URL. Legacy paths are first-class (`path` = `legacy_path` on import).

Body is `body_json` blocks (`p`, `h2`, `ul`, `faq`, …), not a parallel HTML CMS. Type-specific data is `type_data_json`.

Status enum includes idea/draft/review/scheduled/published/unpublished/archived. Import writes **published**.

`search_tsv` is a generated `simple` FTS column. Arabic normalization is stored in `title_normalized` / `body_normalized`.

## Revisions

`document_revisions` are immutable snapshots. Publish points `published_revision_id` (deferrable FK). No `deleted_at` on revisions.

## Sources

Catalog `sources` + join `document_sources` (name, url, type, accessed_at). Not every document needs a source; YMYL articles from `articles.json` keep theirs.

## Do not expand taxonomy for fun

Seeded categories match **current** site families (calendar, salaries, holidays, tools, support, trending, gold, usd, legal, countdown, articles). No empty Technology/AI trees.
