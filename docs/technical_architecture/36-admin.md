# 36 — Admin Architecture

`/admin` React app, `noindex`, `robots: noindex`, `X-Robots-Tag: noindex`. Auth required.

Modules compose domain APIs only. No SQL in UI.

Nav: Dashboard, Content, Media, Users, Community, Moderation, SEO, Tools, Social, Automation, Jobs, Analytics, Settings, Flags, Audit, Health.

Dashboard widgets: failed jobs, snapshot age, 127 route check last run, flags.

Staff roles only. Analyst: read dashboards, no publish.
