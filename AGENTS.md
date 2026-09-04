# AGENTS.md

Guidance for AI coding agents working in **sdd-analytics-copilot**.

## North star

This repo demonstrates **Spec-Driven Development**. Prefer changing specs and contracts before implementation. Keep the Bahasa Indonesia demo journey working:

1. Bandingkan pendapatan bulan lalu
2. Jelaskan penurunan **Sumatera**
3. Tambahkan investigasi ke dasbor eksekutif
4. Patch widget dasbor via structured ops

If source is wiped, regenerate from **`specs/regeneration/`** (blueprint + prompts) and requirements **SDD-001…013**.

## Boundaries (do not break)

- **Never** let the LLM execute arbitrary SQL. Always go through `QueryPlan` → validate → compile → execute (inject `company_id`).
- Dashboards are **JSON specs**, not generated React components.
- Keep the stack a **monolith** (Next.js + SQLite) unless an ADR changes that.
- Demo clock is fixed at `2026-09-05` in `src/server/analytics/time-range.ts` so “bulan lalu” stays August 2026.
- Soft multi-tenancy via `x-company-id` (default `tokoraya`).

## Where to edit

| Concern | Path |
|---------|------|
| Requirements | `specs/requirements/` |
| Regeneration prompts | `specs/regeneration/` |
| Semantic model | `semantic/commerce.yaml` |
| QueryPlan / SQL | `src/server/analytics/` |
| Agent | `src/server/agent/` (mock + Vertex) |
| Dashboard DSL | `src/server/dashboard/` |
| Seed / CSV | `data/seed.ts`, `data/csv-profiles.ts`, `data/samples/` |
| GCP login | `scripts/gcp-*.cjs` |
| Acceptance tests | `tests/acceptance/` |

## Commands

```bash
npm run db:seed          # rebuild demo.sqlite from data/samples CSV (or --generate)
npm run db:seed:generate # procedural seed only
npm run data:export-csv  # export demo.sqlite → data/samples (per-company columns)
npm run demo             # seed + next dev
npm run login            # gcloud ADC → .gcloud/ + GCP_* in .env
npm run generate-env     # create .env from .env.example if missing
npm test                 # vitest (AGENT_BACKEND=mock)
```

## When adding a feature

1. Add/extend `SDD-xxx` requirement + acceptance scenario
2. Update domain/OpenAPI/agent specs if contracts change
3. Implement behind the contract
4. Add a test that asserts the QueryPlan / DashboardSpec boundary
5. Ensure a runtime trace step exists for new agent behaviour
6. If ops/scripts change, update SDD-011/013 and regeneration prompts
