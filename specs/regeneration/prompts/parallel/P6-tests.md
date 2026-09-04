# P6 — tests (OWNED PATHS ONLY)

You are agent **P6-tests** regenerating sdd-analytics-copilot after a source wipe.

## OWNED PATHS (create only these)
- `tests/acceptance/SDD-004.test.ts`
- `tests/acceptance/SDD-007.test.ts`
- `tests/integration/query-plan.test.ts`
- `tests/evals/demo-prompts.test.ts`

## Specs
- `specs/acceptance/*.feature`
- `vitest.config.ts` already forces `AGENT_BACKEND=mock`
- Assert QueryPlan boundary: evidence SQL contains `company_id`; no raw LLM SQL
- Cover Sumatera decline / demo prompts in Bahasa
- `seedDatabase` + `resetEnsureFlag` in `beforeAll`
- Path alias `@/` per tsconfig

## Done when
Test files exist and would pass once app modules are regenerated.
