# 35 — Feature Flags (technical)

Table `feature_flags`. Evaluate `flags.isEnabled(key, { env, userId })`.

Defaults from Phase 0 `34-feature-flags.md`. Extra: `seo.ugc_auto_index=false`, `email_enabled=false`.

Cache snapshot JSON at edge 30s. Admin PATCH purges.

**Do not 404 indexed URLs when a marketing flag flips.** `calendar_enabled` off would be a catastrophe — it stays **true**. `travel_enabled` false does not delete `/trending/saudi-tourism-guide`.
