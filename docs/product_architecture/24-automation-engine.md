# 24 — Automation Engine

Model: **Trigger + Condition + Action**. Human-defined rules in admin.

## Examples

1. WHEN `content.published` IF `category = ai` AND flag on THEN `social.publish` Facebook+Telegram+X  
2. WHEN `question.created` IF `category = android` THEN `notify.topic_followers`  
3. WHEN `analytics.threshold` (page_view 7d ≥ N) THEN `social.reshare_queue`

## Objects

```
AutomationRule { trigger, conditions[], actions[], enabled, cooldown, created_by }
```

Conditions: category, type, flag, indexable, locale, topic, author role.

Actions: enqueue job types only (never inline HTTP to Facebook from the CMS request).

## Safety

- Disabled if `social_auto_publish_enabled` is false even if rule enabled.
- Rate limits per provider.
- Dry-run in admin.
- Audit log of every firing.
- Cannot unpublish or delete content.
- Cannot set `indexable=true` on UGC without going through Quality Gate action that itself is conservative.

## Ownership

Automation module. Executes via Queue. CMS/Community only emit events.
