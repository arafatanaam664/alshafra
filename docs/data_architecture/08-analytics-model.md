# 08 — Analytics Model

Internal analytics is **not** Google Analytics. GA remains an optional snippet behind `analytics_ga_enabled`.

## Tables

| Table | Role |
|---|---|
| `analytics_events` | Append-only raw events. No raw IP, no email, no passwords. Optional `session_hash`. |
| `page_view_daily` | Rollup foundation (day, path, views, unique_sessions) |
| `content_metrics` | Per-document counters, seeded **0** |
| `tool_metrics` | Per-tool counters, seeded **0** |
| `search_queries` / `popular_searches` | Search analytics foundation |

Phase 4 does not ingest live traffic. Do not invent numbers.

Retention: delete `analytics_events` older than 90 days (job later). Free-tier disk.
