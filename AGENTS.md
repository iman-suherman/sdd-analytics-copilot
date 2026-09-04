# AGENTS.md

Guidance for AI coding agents working in **sdd-analytics-copilot**.

## North star

This repo demonstrates **Spec-Driven Development**. Prefer changing specs and contracts before implementation. Keep the demo journey working:

1. Compare last month revenue
2. Explain APAC decline
3. Add investigation to executive dashboard
4. Patch dashboard widgets via structured ops

## Boundaries (do not break)

- **Never** let the LLM execute arbitrary SQL. Always go through `QueryPlan` → validate → compile → execute.
- Dashboards are **JSON specs**, not generated React components.
- Keep the stack a **monolith** (Next.js + SQLite) unless an ADR changes that.
- Demo clock is fixed at `2026-09-05` in `src/server/analytics/time-range.ts` so “last month” stays August 2026.

## Where to edit

| Concern | Path |
|---------|------|
| Requirements | `specs/requirements/` |
| Semantic model | `semantic/commerce.yaml` |
| QueryPlan / SQL | `src/server/analytics/` |
| Agent | `src/server/agent/analytics-agent.ts` (+ `vertex-agent.ts`, mock fallback) |
| Dashboard DSL | `src/server/dashboard/` |
| Seed data | `data/seed.ts` + `data/samples/` (per-company CSVs) |
| Acceptance tests | `tests/acceptance/` |

## Commands

```bash
npm run db:seed   # rebuild demo.sqlite from data/samples CSV (or --generate)
npm run data:export-csv  # export demo.sqlite → data/samples (per-company columns)
npm run demo      # seed + next dev
npm run login     # gcloud ADC → .gcloud/ + GCP_* in .env
npm run generate-env  # create .env from .env.example if missing
npm test          # vitest (AGENT_BACKEND=mock)
```

## When adding a feature

1. Add/extend `SDD-xxx` requirement + acceptance scenario
2. Update domain/OpenAPI/agent specs if contracts change
3. Implement behind the contract
4. Add a test that asserts the QueryPlan / DashboardSpec boundary
5. Ensure a runtime trace step exists for new agent behaviour
