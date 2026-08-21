# 07 — Import Rules

Allowed:

```ts
import { todayGregorian } from '@alshafra/calendar';
```

Forbidden:

```ts
import x from '@alshafra/content/src/internal/foo';
import x from '../../../../packages/content/src/foo';
```

Enforced by `npm run boundaries`.  
Legacy `apps/web/src/lib/hijri.ts` re-exports the calendar package so old relative imports keep working.
