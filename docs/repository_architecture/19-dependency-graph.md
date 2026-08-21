# 19 — Dependency Graph

```mermaid
flowchart TB
  subgraph apps
    web["@alshafra/web"]
    admin["@alshafra/admin"]
  end
  subgraph domain
    calendar["@alshafra/calendar"]
    content["@alshafra/content"]
    tools["@alshafra/tools"]
    seo["@alshafra/seo"]
    search["@alshafra/search"]
    media["@alshafra/media"]
    social["@alshafra/social"]
    auth["@alshafra/auth"]
    notifications["@alshafra/notifications"]
    analytics["@alshafra/analytics"]
  end
  subgraph infra
    database["@alshafra/database"]
    config["@alshafra/config"]
    kernel["@alshafra/kernel"]
    ui["@alshafra/ui"]
  end
  web --> calendar
  web --> seo
  web --> tools
  web --> ui
  web --> config
  admin --> ui
  admin --> auth
  tools --> calendar
```

No cycles. `ui` has no inbound domain deps. Packages currently have **zero** package-to-package imports except `tools` *may* import calendar later; today `tools` is data-only.

`apps/web` still contains page-level logic (legacy). New logic must not be added there if it belongs in a package.
