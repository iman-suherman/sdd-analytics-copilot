# P5 — API routes (OWNED PATHS ONLY)

You are agent **P5-api** regenerating sdd-analytics-copilot after a source wipe.

## OWNED PATHS (create only these)
- `src/app/api/companies/route.ts`
- `src/app/api/analytics/query/route.ts`
- `src/app/api/agent/chat/route.ts`
- `src/app/api/dashboards/route.ts`
- `src/app/api/semantic-model/route.ts`
- `src/app/api/traces/route.ts`

## Specs
- `specs/api/openapi.yaml` (implement exactly)
- Call into `@/server/*` modules from P2/P3
- `export const runtime = "nodejs"`
- Scope with `companyIdFromRequest(request)`
- Ensure DB via `ensureDatabase()` at start of handlers

## Done when
All six route files exist and match OpenAPI shapes.
