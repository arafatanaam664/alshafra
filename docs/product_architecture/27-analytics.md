# 27 — Analytics

## External

- Google Analytics 4 (flag `analytics_ga_enabled`) — **not in code today**
- Google Search Console — DNS verification (ops)
- Bing Webmaster Tools — already aligned with IndexNow

Do not block rendering on analytics JS. Consent: follow privacy policy; update when using cookies.

## Internal events

| Event | Properties (examples) |
|---|---|
| `page_view` | path, content_id, type, locale |
| `search` | q_len, results |
| `tool_used` | tool_id, action |
| `share` | network |
| `copy_link` | |
| `signup` | method |
| `comment` | |
| `question_created` | |
| `answer_created` | |
| `download` | asset_id |
| `social_click` | |

## Architecture

`AnalyticsProvider` interface: `GaProvider`, `InternalProvider` (insert into `events` table, sampled if needed).

No PII in event props. IP not stored raw.

Admin dashboards for Analyst role. Export later.

## Search Console / Bing

Not “events”. SEO Manager uses them as evidence. Phase 0 lists connecting them as **human ops**, not as code in this phase.
