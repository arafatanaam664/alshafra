# Phase 17 — Internal linking

Engine: `packages/content/src/linking.ts` + `explore.ts`.

Signals, in order:

1. Manual links
2. Topic clusters
3. Gold/USD country pairs
4. Countdown targets
5. Structural next steps
6. Token overlap + `scoreRelated()` (topic, cluster, pair, hub)

Public UI groups results as:

- انتقل بعدها إلى
- مواضيع ذات صلة
- أدوات تفيدك الآن
- المزيد في هذا القسم

Noindex targets are excluded. Auto related stays capped. Future sections stay off the graph.
