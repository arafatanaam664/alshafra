# 34 — Feature Flags

Flags are **data** in Settings, cached at the edge, overridable per environment.

## Initial catalog

| Flag | Default | Notes |
|---|---|---|
| `community_enabled` | false | |
| `comments_enabled` | false | |
| `registration_enabled` | false | |
| `tools_enabled` | true | legacy tools |
| `ai_enabled` | false | AI **content section** |
| `ai_assist_enabled` | false | AI in CMS |
| `jobs_enabled` | false | |
| `scholarships_enabled` | false | |
| `travel_enabled` | false | `/trending` travel URLs still exist; flag hides *new* hub, does not 404 old URLs |
| `opportunities_enabled` | false | |
| `comparisons_enabled` | false | |
| `solutions_enabled` | false | |
| `social_auto_publish_enabled` | false | |
| `advanced_search_enabled` | false | basic search may still ship |
| `ads_enabled` | false until slots real | |
| `analytics_ga_enabled` | false | |
| `trends_enabled` | true | existing `/trending` |
| `calendar_enabled` | true | |

## Flow

Admin toggles → audit log → cache purge of nav/layout → routes not in sitemap if off.

**Never** 404 a previously indexed URL just because a marketing flag flipped, except for sections that never had public URLs.

## Evaluation

`flag(name, { user, path })` supports future % rollout. Phase 1: boolean global is enough.
