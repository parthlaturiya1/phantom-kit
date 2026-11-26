---
inclusion: always
---

# Tech

## Stack

- TypeScript with `strict` on.
- Vite for build and dev server.
- Preact for UI (with `@preact/preset-vite`).
- npm workspaces: `packages/kit`, `apps/spinlab`, `apps/cardforge`, `recipes/*`.
- Vitest for unit tests. fast-check for property tests.
- Playwright with `@axe-core/playwright`. Chromium only.
- ESLint with the TypeScript plugin.

## Shape

- Static browser app. No server.
- No runtime AI. No CDN. No analytics. No paid service.
- Licence: MIT.

## Repo rules

- `.kiro` is tracked. `.gitignore` must never name `.kiro`.
- Secrets only in `.env`. `.env` is ignored. `.env.example` is tracked and holds no real values.
- Only `docs/brief.md` is a public plan file.

## Verify

`npm run verify` runs, in order: typecheck, lint, unit, property, build, e2e smoke, secret scan, `.gitignore` check. Each failing step prints a GitHub `::error` line.

## Node

Pinned to Node 22 LTS in `.nvmrc` and CI. `engines.node` is `>=22`.

## Windows PowerShell

Script execution is disabled. Use `npm.cmd` and `npx.cmd`, not `npm` and `npx`.

## Dependencies

Ask first before adding any dependency outside the allowed list. State licence and size.
