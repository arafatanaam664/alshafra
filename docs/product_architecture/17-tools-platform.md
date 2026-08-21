# 17 — Tools Platform

## Goal

Run many tools (legacy + future) with one contract: **static explanation + small interactive island + explicit data mode**.

## Tool contract

```
Tool {
  id, slug, path, title, disclaimer,
  engine_key,
  runtime: "static" | "island",
  data_mode: "none" | "build_snapshot" | "client_compute" | "server_fetch",
  seo: { indexable, title, description },
  config: JSON
}
```

Legacy mapping: see `05-legacy-tools-integration.md`. **`path` is the public URL.** New tools may use `/tool/{slug}` or a short path if it does not collide.

## Engines

| engine_key | Compute where | Notes |
|---|---|---|
| `calendar.hijri_convert` | client + build | Same code as today |
| `calendar.today_riyadh` | build + client | |
| `calendar.month` | client | |
| `calendar.age` | client | |
| `calendar.countdown` | build dates + client tick | |
| `gov.salary_next` | build/client | weekend rule |
| `market.gold_gram` | build snapshot | |
| `market.usd_rate` | build snapshot | |
| `text.decorate` | client | |
| future calculators | client first | |

**No live scrape inside page render.** Snapshots via jobs.

## Adding a tool

1. Register Tool entity.
2. Implement engine in `modules/tools` (framework-agnostic TS).
3. Island UI.
4. Editorial body (CMS).
5. SEO fields.
6. Feature flag if not core.
7. Quality check before index.

## Collision rules

- Cannot register a path that matches a preserved legacy URL unless it **is** that tool.
- `/date-converter` stays the date converter.

## Future tools (examples, not commitments)

Zakat calculator (religious YMYL — needs scholarly sources), percentage, unit conversion. Each must pass quality, not catalog spam.
