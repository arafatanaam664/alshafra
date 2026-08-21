# 14 — SEO Data Model

## Inheritance

```
Site settings (seo.*)
  → Category/section defaults (optional)
    → Document/tool SEO row
      → Override (indexable_override, robots)
```

Resolve: more specific wins. Missing og_image → site default R2/og.

## Per-entity fields

index, noindex, follow, nofollow (as `robots_directive`), canonical_url (blank = self), title (`seo_title` fallback `title`), description, og_*, twitter = same as og unless later split, schema_type + schema_json.

## Title policy (H2)

Renderer:

```
seo_title if set
else title
never automatically append " | Alshafra"
Admin may type a suffix if length allows
```

`document.title` is H1 unless `h1_override`.

## Quality gate (programmatic)

`unique_text_word_count` excludes known boilerplate hashes. Threshold configurable (`seo.min_unique_words`, start **800 unique**, not 1500 padded). YMYL requires ≥1 `sources` row.

## Schema

Built by SEO module from type: Article, WebApplication, FAQPage, BreadcrumbList, Organization (site), WebSite with `name: Alshafra`, `alternateName: ["تقويم السعودية","Saudi Calendar"]`.

Remove SearchAction until `/search` works, then `https://alshafra.com/search?q={search_term_string}`.

## HIGH URL title changes

Permission `seo.edit_high_intent` — SEO Manager. List of HIGH paths in settings.
