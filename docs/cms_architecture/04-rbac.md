# 04 — RBAC

Phase 4 permission keys remain canonical (`documents.publish`, …). UI aliases (`content.publish`) map in `@alshafra/cms` (ADR-501).

Roles: author, editor, seo_manager, analyst, moderator, social_manager, admin, super_admin.

Author cannot publish. Editor can. Analyst can read analytics, not publish. Super Admin has all keys.

UI hiding is not security — every API handler checks `requirePermission`.
