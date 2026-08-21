# 04 — Content Adapter

```ts
interface ContentProvider { getAll(): PageModel[]; get(path: string): PageModel | undefined }
```

**Current:** `LegacyContentProvider` in `apps/web/src/content/provider.ts`

Sources (not the database):

| Data | File |
|---|---|
| URL list / titles | `apps/web-legacy/public/published.json` |
| Articles | `articles.json` |
| Countdowns | `countdowns.json` + `@alshafra/calendar` |
| Trending | `trending.json` |
| Prices | `prices.json` + `countries.json` |
| Tool copy | `core-guides.json` |

Future: `DatabaseContentProvider` implementing the same interface. Pages do not import JSON directly except via this module.
