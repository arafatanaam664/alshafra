# 33 — Automation

`automation_rules.trigger` e.g. `content.published`.

`conditions_json`: `{ "op": "and", "items": [ { "field": "category.key", "eq": "ai" } ] }`  
Support `and` / `or` one level deep in v1 (no nested graphs).

`actions_json`: `[{ "type": "enqueue_job", "job": "social.publish", "providers": ["telegram"] }]`.

Only enqueues jobs. Dry-run in admin. Disabled if master social flag off.

No loops. Cooldown per rule.
