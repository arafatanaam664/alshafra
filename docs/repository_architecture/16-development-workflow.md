# 16 — Development Workflow

```
npm install          # workspace links
npm run dev          # public site
npm run typecheck
npm run lint
npm run test
npm run build        # 127 prerendered URLs
```

CI-ready order: install → lint → typecheck → test → build.

No Husky (avoids slow commits). No full E2E on commit.
