# 22 — API Contracts

All prefix `/api/v1`. JSON. Error model `23`. Zod at boundary.

---

## GET `/public/prices/latest`

- **Auth:** none  
- **Purpose:** latest gold/FX snapshot for islands  
- **Response 200:** `{ captured_at, xau_usd, source, rates: Record<string, number> }`  
- **Cache:** `s-maxage=3600`  
- **Rate:** 60/min IP  

## POST `/public/events`

- **Auth:** none  
- **Purpose:** analytics beacon  
- **Request:** `{ name: string, path: string, props?: object }` names allowlist  
- **Response:** 204  
- **Rate:** 120/min  
- **Idempotency:** not required  

## GET `/public/health`  → see observability (`/health` also at root)

---

## POST `/auth/sign-in-email`

- **Auth:** none  
- **Request:** `{ email }`  
- **Response:** 202 `{ ok: true }` (always, anti-enumeration)  
- **Rate:** 5/15min  

## GET `/auth/callback` — OAuth redirect (not JSON)

## POST `/auth/sign-out` — cookie clear, 204, auth required

---

## GET `/me`

- **Auth:** user  
- **Response:** `{ id, handle, display_name, roles[], permissions[] }`

---

## Admin documents

### GET `/admin/documents`

Auth staff. Query: `type,status,q,cursor,limit`. Response list + cursor.

### POST `/admin/documents`

- **Auth:** `documents.create`  
- **Request:** `{ type, title, slug?, path?, excerpt?, body_json?, category_id?, locale? }`  
- **Response 201:** document  
- **Errors:** 409 path taken  

### GET `/admin/documents/:id`

### PATCH `/admin/documents/:id`

- **Auth:** `documents.update`  
- **SEO fields:** require `documents.seo_edit` if HIGH path  

### POST `/admin/documents/:id/publish`

- **Auth:** `documents.publish`  
- **Idempotency-Key:** required  
- **Response:** document + `job_ids[]`  
- **Does not wait for social**

### POST `/admin/documents/:id/unpublish` — permission publish

### POST `/admin/documents/:id/restore/:version` — editor

### GET `/admin/documents/:id/revisions`

---

## Admin routes / redirects / flags / settings

| Method | Path | Perm |
|---|---|---|
| GET/PUT | `/admin/redirects` | `seo.redirects_manage` |
| GET/PATCH | `/admin/flags/:key` | `flags.toggle` |
| GET/PATCH | `/admin/settings/:key` | `settings.write` (or group) |
| GET | `/admin/jobs?status=` | admin |
| POST | `/admin/jobs/:id/retry` | admin |
| GET | `/admin/audit` | `audit.read` |

---

## Media

`POST /admin/media` multipart, `media.upload`, 201 media DTO.

---

## Social (schema ready, **flag off** — do not call providers in Phase 2 unless flagged)

`POST /admin/social/accounts/:provider/connect`  
`DELETE /admin/social/accounts/:id`  
`POST /admin/social/posts` enqueue only  

---

## Community (flag off — contracts exist)

`POST /me/questions` → 201 noindex  
`POST /me/questions/:id/answers`  
`POST /me/votes` `{ target_type, target_id, value }` idempotent per user  

---

## Idempotency

Replay of same key + same body returns original 201 payload. Different body → 409.
