# 08 — ID Strategy

## Decision (ADR-116)

**UUIDv7** stored as Postgres `uuid`, generated in the application (or `extensions` if available).

## Comparison

| | UUID v4 | **UUIDv7** | BIGINT identity |
|---|---|---|---|
| Sortable by time | no | **yes** | yes |
| Index locality | poor | **good** | best |
| Guessable / enumerable | no | time bits only, not sequential user ids | **yes — bad for `/question/{id}`** |
| Distributed generation | yes | yes | needs sequence |
| URL exposure | ok | **ok** | leaks volume |
| Supabase | native uuid | native uuid | native |

v7 is the best fit for CMS + future community URLs.

## Rules

- All PKs `uuid` except pure M2M with composite keys.
- Public community URLs: `/question/{id}/{slug}` uses uuid (not bigint).
- Do not expose internal sequential anything.
- `auth.users.id` is UUID v4 from Supabase — domain `users.id` is **independent UUIDv7**; link via `auth_user_id`.
- Idempotency keys are **text**, not uuids of the job.

## Generation

```ts
// packages/kernel/id.ts
export function newId(): string // uuidv7
```

Never `gen_random_uuid()` for documents if we want v7; if DB default is v4, override in app. **NEEDS VERIFICATION:** whether the hosted Postgres has `pg_uuidv7`. If not, generate in TypeScript (`uuidv7` package or `crypto` when available). Fallback: generate v7 in app always — **preferred**, zero extension dependency.
