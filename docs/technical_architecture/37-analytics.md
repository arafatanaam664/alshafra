# 37 — Analytics (technical)

Allowlisted event names: `page_view`, `article_view`, `tool_used`, `search`, `share`, `copy_link`, `signup`, `login`, `question_created`, `answer_created`, `comment_created`, `download`, `social_click`.

Beacon `POST /api/v1/public/events`. Props: path, tool_id, network — no email, no raw IP (CF hash optional not stored v1).

GA4: `PUBLIC_GA_ID` if `analytics_ga_enabled`. Load async in layout. GSC/Bing verification tokens in `site_settings` / HTML meta.

Retention: delete `analytics_events` older than 90 days (job) on free disk.
