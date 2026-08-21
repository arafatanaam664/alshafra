# 41 — Content Lifecycle

```
Idea → Draft → Review → Scheduled → Published → Updated → Archived
                                              ↘ Unpublished
```

| State | Who | SEO | Social | Cache | Search |
|---|---|---|---|---|---|
| Idea | Editor | none | none | none | none |
| Draft | Editor | noindex preview | none | none | none |
| Review | Editor+ | noindex | none | none | none |
| Scheduled | Publisher | noindex until fire | none | none | none |
| Published | public | index if quality | may enqueue | write HTML, purge | index |
| Updated | public | index; lastmod | optional re-share rule | revalidate | update |
| Unpublished | 404 or 410 policy | remove sitemap | none | purge | delete |
| Archived | often still 200 | year pages stay index; others noindex | none | keep | keep if index |

Archived **year documents** (`hijri-calendar-1448`) stay published/indexable.

Unpublish of a HIGH SEO URL requires SEO Manager confirmation (410 vs 404 vs redirect).
