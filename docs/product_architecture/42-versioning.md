# 42 — Versioning

Every CMS save creates a `Revision`: body+seo snapshot, author, timestamp, message.

- Compare any two revisions (text diff).
- Restore → new revision (never rewrite history).
- Publish stores `published_revision_id`.
- Tools config (salary day_of_month) is versioned too — changing 27→26 is a YMYL event.

UGC: answers editable with history optional; edits by mods logged in audit, not necessarily public diff.
