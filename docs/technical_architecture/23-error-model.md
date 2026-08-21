# 23 — Error Model

```json
{
  "error": {
    "code": "documents.not_found",
    "message": "Document not found",
    "details": {},
    "request_id": "uuid"
  }
}
```

| HTTP | code examples |
|---|---|
| 400 | `validation_error` |
| 401 | `unauthorized` |
| 403 | `forbidden` |
| 404 | `not_found` |
| 409 | `conflict` |
| 410 | `gone` |
| 429 | `rate_limited` |
| 500 | `internal` |

`message` is safe for UI (Arabic in `Accept-Language` later; v1 English codes + AR messages map in admin). **No** SQL, stack, or token in `details` in production.

`request_id` from `cf-ray` or generated UUID, logged everywhere.
