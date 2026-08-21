# 20 — Recommendation Engine

**Start rule-based. No ML required.**

## Recs

| Kind | Rule |
|---|---|
| Related | Linking engine (topics + manual) |
| Popular | 7–28 day page_view among same section |
| Trending | Unusual lift vs baseline (optional; needs analytics). Not Google Trends titles dumped as recs |
| Similar | Same category + overlapping tags |
| Recently viewed | Local storage / signed cookie, client-side, no PII server required |
| Personalized | Future; needs identity. Flag off |

## Placement

End of article, tool sidebar, homepage modules.

## Constraints

- Never recommend noindex or unpublished.
- Never recommend 410.
- Calendar users should see calendar recs first when the session started on a calendar URL.
- Cache recs lists (see `31-performance.md`); invalidate on publish.
