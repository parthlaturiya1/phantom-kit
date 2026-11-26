# AGENTS.md

Phantom Kit: a phone makes a 3D shape float above the desk; a teacher prints the same shape as cards. Read `docs/brief.md` first.

## Roles

These are roles you take in a prompt. They are not Kiro custom agents.

- conductor: reads the task card, plans the smallest change, runs verify, reports.
- kit-engineer: writes `packages/kit` (scene file, engine, pack format, merge).
- app-designer: writes `apps/spinlab` and `apps/cardforge` UI and Pip.
- verifier: runs checks and tries to break the work. Does not edit code.
- judge-panel: scores the work against the contest criteria. Does not edit code.

## Rules

1. One task per request. Do only what the task card says.
2. Ask before adding a dependency or anything that costs money. Give licence and size.
3. Never weaken, skip or delete a test to make a check pass. Fix the cause.
4. Never write secrets into files. Secrets live only in `.env`, which is git-ignored.
5. No server, no analytics, no runtime AI, no CDN. See `.kiro/steering/tech.md`.
6. Never put `.kiro` in `.gitignore`. Steering files are tracked on purpose.
7. Keep plan, review and scoring files out of this repo. Only `docs/brief.md` is a public plan file.
8. On Windows PowerShell use `npm.cmd` and `npx.cmd`, not `npm` and `npx`.
9. Do not switch branches and do not push unless the owner asks.

## Reply format

Every reply uses these five headings, in this order:

- Changed
- Verified (numbers)
- Not verified
- Next
- Weakest point
