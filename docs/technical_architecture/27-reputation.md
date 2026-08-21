# 27 — Reputation

Append-only `reputation_events`. `users.reputation_points` is a cached sum (job or trigger).

## v1 points (when community on)

| Action | Points | Cap |
|---|---|---|
| Answer accepted | +15 | 20/day |
| Answer upvote | +10 | 50/day |
| Question upvote | +5 | 20/day |
| Downvote received | -2 | — |
| Spam hidden | -50 | — |

## Anti-abuse

- No points from self-votes  
- Same-IP sockpuppet: mods  
- New users cannot give reputation for 24h  
- Caps per day  
- Trusted User: manual or points ≥ threshold **and** age ≥ 14d **and** not banned — still human grant preferred  

Reputation **cannot** force index.
