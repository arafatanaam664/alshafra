# 16 — Community Architecture

**Flag:** `community_enabled` default **false**.  
Architecture is specified so it can turn on without a rewrite.

## Objects

- Question
- Answer
- Comment (on questions, answers, and optionally editorial — `comments_enabled` separate)
- Vote (up/down, one per user per target)
- Like (optional alias of up-vote for comments)
- Bookmark
- Follow (user, question, topic)
- Mention
- Accepted answer (question author or moderator)
- Reputation ledger
- Badge
- Profile
- Notification
- Report

## User capabilities

Ask, answer, comment, vote, share, save, follow — subject to anti-spam and new-user limits.

## Quality Gate (UGC SEO)

Default: **`noindex, follow`**, excluded from sitemap.

May become indexable only if **all** hold:

| Signal | Bar (initial policy, tunable) |
|---|---|
| Moderation | Not spam, not rejected, not pending |
| Completeness | Title ≥ N chars, body ≥ N chars, category set |
| Uniqueness | Not duplicate of another question/article (similarity check) |
| Answers | ≥ 1 answer above quality length **or** accepted answer |
| Engagement | Optional: votes/bookmarks threshold |
| Author | Not new-user restricted; not banned |
| Links | No untrusted link dump |

SEO Manager can override to noindex. Automation can only **propose** index; human or strict rule publishes the robots change.

## Trust vs editorial

- UGC labeled as مجتمع.
- Ads: more conservative on UGC (flag).
- No UGC in Organization `Article` schema unless it passed the gate.
- Reputation cannot buy index.

## Moderation hooks

New-user: rate limits, link restriction, captcha (Turnstile).  
Trusted User: higher limits.  
Reports → queue.  
Duplicates: suggest existing question + editorial content before post.

## URL

`/question/{id}/{slug}` — slug change does not 404 if id remains.

Do not put UGC under `/articles/`.
