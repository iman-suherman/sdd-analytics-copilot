# P2 — server core (OWNED PATHS ONLY)

You are agent **P2-server-core** regenerating sdd-analytics-copilot after a source wipe.

## OWNED PATHS (create only these)
- `src/server/database/**`
- `src/server/company/**`
- `src/server/analytics/**`
- `src/server/dashboard/**`
- `src/server/traces/**`

Do **not** edit `src/server/agent`, `src/server/gcp`, `data/`, `scripts/`, UI, API routes, or tests.

## Specs + contracts
- `specs/requirements/SDD-003`, `SDD-005`, `SDD-006`, `SDD-007`, `SDD-009`, `SDD-010`
- `specs/domain/query-plan.md`, `semantic-model.md`, `time-range.md`, `company.md`
- Copy verbatim:
  - `contracts/database-schema.ts.txt` → `src/server/database/schema.ts`
  - `contracts/query-plan.ts.txt` → `src/server/analytics/query-plan.ts`
  - `contracts/time-range.ts.txt` → `src/server/analytics/time-range.ts`
  - `contracts/dashboard-schema.ts.txt` → `src/server/dashboard/schema.ts`
- Load semantic model from `semantic/commerce.yaml`
- SQLite via better-sqlite3 + drizzle; path `data/demo.sqlite`
- `ensureDatabase()` should call into seed if missing — use dynamic import of `../../../../data/seed` `seedDatabase` (P1 owns seed; if missing, create schema only and document)
- Compiler **must** inject `company_id` into SQL
- `companyIdFromRequest` reads `x-company-id`, default `tokoraya`
- Dashboard service: list/get/save/patch + `createExecutiveFromInvestigation`
- Traces: save/list/get with steps JSON

## Exports other agents need
- analytics `index.ts` re-exports validate/compile/execute/loadSemanticModel/QueryPlanSchema
- `executeQueryPlan(plan, companyId)` returns value/rows/evidence/visualisation
- `DEFAULT_COMPANY_ID`, `listCompanies`, `requireCompanyId`, `companyIdFromRequest`

## Done when
All owned files exist and respect DEMO_AS_OF + QueryPlan boundary.
