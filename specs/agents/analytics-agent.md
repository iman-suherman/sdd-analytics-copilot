# Analytics agent

Implements `SDD-004`, `SDD-007`, `SDD-008`, `SDD-009`, `SDD-010`, `SDD-012`, `SDD-013`.

## Behaviour

1. Understand user intent (Bahasa Indonesia prompts)
2. Resolve metrics/dimensions against `semantic/commerce.yaml`
3. Emit a **QueryPlan** (never raw SQL)
4. Validate + execute with **request `companyId`** injected into SQL
5. Optionally run breakdowns (region/segment) for diagnostic questions
6. Generate Bahasa answer + evidence + chart recommendation
7. Persist an agent trace (include backend: vertex|mock)
8. On dashboard intents, mutate `DashboardSpec` via structured patches

## Backends

| Mode | Selection | Notes |
|------|-----------|-------|
| Vertex | ADC + `GCP_PROJECT_ID`, unless `AGENT_BACKEND=mock` | `@google/genai` `vertexai: true`; model `VERTEX_MODEL` (default `gemini-2.5-flash`); location `VERTEX_AI_LOCATION` (default `global`) |
| Mock | Tests / offline / fallback | Deterministic demo journey |

On Vertex failure: fall back to mock for the turn; record `vertex_fallback` in the trace.

## Modules

- `analytics-agent.ts` — conversation persistence + backend router
- `mock-agent.ts` — rule-based plans + answers
- `vertex-agent.ts` / `vertex-llm.ts` / `vertex-client.ts` — plan + narrate
- `src/server/gcp/credentials.ts` — `.env` + `.gcloud` ADC resolution

## Demo intents (mock)

- Compare last month revenue
- Why Sumatera declined
- Add investigation to executive dashboard
- Replace region widget with segment
- List semantic metrics/dimensions
