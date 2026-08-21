# 43 — Design System

Package `packages/ui`. RTL-first (`dir=rtl` on `html lang=ar`). Brand green from current `tailwind.config.js` (do not invent indigo).

**Alshafra** wordmark; calendar section uses same chrome.

## Modes

Light default. Dark: `class` strategy, later; architecture: CSS variables `--bg --fg --brand`. v1 ships light + `prefers-color-scheme` optional.

## Components (implement in Phase 2+)

Button, Input, Card, Modal, Dropdown, Tabs, Pagination, Breadcrumb, Alert, Toast, Table, Form, Editor (admin), Search, Share buttons.

Typography: self-hosted IBM Plex Sans Arabic subset woff2 weights 400/600/700 (Phase 0 perf). Display optional Reem Kufi **one weight** or drop to reduce LCP.

Responsive: `container-page` breakpoints as today.

Admin may use same tokens, denser spacing.
