# Parallel multi-agent regeneration

**Goal:** Rebuild wiped application source from `specs/` + `semantic/` + `data/samples/` in **under 30 minutes** using **parallel agents** with exclusive path ownership.

**Keep after wipe:** `specs/`, `semantic/`, `data/samples/`, `docs/`, `public/`, `AGENTS.md`, `README.md`, `.cursor/`, `.env.example`, `.gitignore`, `package.json`, `package-lock.json`, config files (`tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `vitest.config.ts`).

**Wipe:** `src/`, `scripts/`, `data/*.ts`, `tests/`, `.next/`, `data/demo.sqlite`, `*.tsbuildinfo`.

## Hard constraints (every agent)

Same as `prompts/regenerate-full-app.md`. Also:

- Prefer implementing contracts under `specs/regeneration/contracts/*.ts.txt` **verbatim** into the matching `src/` path (strip `.txt`).
- Do **not** edit files outside your OWNED PATHS.
- Do **not** change `package.json` dependencies unless Wave 0 said so.
- Bahasa Indonesia UI; `DEMO_AS_OF=2026-09-05`; QueryPlan boundary.

## Waves

| Wave | Agents (parallel) | Owns |
|------|-------------------|------|
| 0 | orchestrator only | Confirm wipe; ensure deps installed |
| 1 | `P1-data-ops`, `P2-server-core`, `P3-agent-vertex`, `P4-ui` | Exclusive trees below |
| 2 | `P5-api`, `P6-tests` | API routes + vitest |
| 3 | orchestrator | `npm run db:seed`, `npm test`, fix cross-cutting breaks |

Target wall clock: Wave 1 ≤ 12m, Wave 2 ≤ 8m, Wave 3 ≤ 8m.

## Owned paths

### P1-data-ops
`data/csv-io.ts`, `data/csv-profiles.ts`, `data/export-csv.ts`, `data/seed.ts`, `scripts/**`

### P2-server-core
`src/server/database/**`, `src/server/company/**`, `src/server/analytics/**`, `src/server/dashboard/**`, `src/server/traces/**`

### P3-agent-vertex
`src/server/agent/**`, `src/server/gcp/**`

### P4-ui
`src/app/globals.css` (if needed), `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/copilot/**`, `src/app/dashboards/**`, `src/app/semantic-model/**`, `src/app/traces/**`, `src/components/**`, `src/lib/**`

### P5-api
`src/app/api/**` only

### P6-tests
`tests/**` only

## How to run (automated)

```bash
# From repo root, after wipe commit:
bash specs/regeneration/run-parallel.sh
```

Requires Cursor Agent CLI logged in (`agent login`) and `agent` on PATH.

## How to run (in-session Cursor)

Launch four Wave-1 Task agents with prompts from `prompts/parallel/P1`…`P4`, wait, then `P5`+`P6`, then verify.
