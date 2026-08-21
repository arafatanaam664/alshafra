# 07 — Tools Model

Tools are not articles. Table `tools` + `tool_categories` + `tool_settings`.

Legacy keys/paths from `@alshafra/tools` `LEGACY_TOOLS` are imported. `name-decoration` is **hidden** (not in the 127). Calendar engine stays in `@alshafra/calendar` with **zero** database imports.

`calendar_programs` stores salary day-of-month + weekend_rule (data). Payday math stays in the calendar package.

`countdown_definitions` store schedule JSON; `/countdown/:slug` remains the public URL.

`price_snapshots` are append-only (captured_at, asset, quote_currency, value, source).
