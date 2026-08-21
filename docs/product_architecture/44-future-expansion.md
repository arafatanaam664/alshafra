# 44 — Future Expansion

Architecture **allows**, Phase 0–1 **does not build**:

- Mobile / desktop apps (same APIs later)
- PWA / offline (manifest exists; no SW today)
- Public API
- Premium / subscriptions
- More languages (real translations, not catalog clones)
- More countries as first-class I18n, not 185 thin pages
- Marketplace

When adding a language: locale table, translated documents, hreflang only for pairs that exist, RTL/LTR per locale. Do not prefix Arabic with `/ar`.

When adding a country: `geo` dimension on content and tools; Saudi calendar remains default data for Saudi tools.
