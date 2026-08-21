# 10 — Feature Flags

Table `feature_flags`: key, is_enabled, description, environment (`all` or specific), rollout_percent, metadata_json, updated_at.

Defaults match Phase 0 §34:

**On:** `calendar_enabled`, `tools_enabled`, `trends_enabled`

**Off:** community, comments, questions, registration, AI, jobs, scholarships, travel, opportunities, comparisons, solutions, social auto-publish, notifications, advanced search, ads, GA, email, `seo.ugc_auto_index`

Flipping a marketing flag must **not** 404 an already indexed URL (`travel_enabled` does not delete `/trending/saudi-tourism-guide`).
