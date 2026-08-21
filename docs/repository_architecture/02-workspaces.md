# 02 — Workspaces

## Tooling (ADR-201)

**npm workspaces** (npm 10.9.8, Node 22).

Not pnpm: the repo already had `package-lock.json` and CI `npm ci`. Switching managers is unnecessary complexity.  
Not Turborepo: two apps, no cache graph needed.

`package.json`:

```json
"workspaces": ["apps/*", "packages/*"]
```

`tools/` is **not** a workspace package.

## Package manager pin

`packageManager`: `npm@10.9.8`  
`engines.node`: `>=22`  
`.nvmrc`: `22`
