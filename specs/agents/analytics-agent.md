# Analytics agent

Implements `SDD-004`, `SDD-007`, `SDD-008`.

## Behaviour

1. Understand user intent
2. Resolve metrics/dimensions against the semantic model
3. Emit a QueryPlan (never raw SQL)
4. Call analytics tools to validate + execute
5. Optionally run breakdowns for diagnostic questions
6. Generate answer + evidence + chart recommendation
7. Persist an agent trace
8. On dashboard intents, mutate `DashboardSpec` via structured patches

## LLM backend

- **Vertex AI (Gemini)** — default when `GCP_PROJECT_ID` + Application Default Credentials (from `npm run login`) are present. The model emits a structured `AgentPlan` / `QueryPlan` JSON only; SQL is never LLM-authored.
- **Mock** — deterministic rule-based path for offline demo and Vitest (`AGENT_BACKEND=mock`).

Env: `VERTEX_MODEL` (default `gemini-2.5-flash`), `VERTEX_AI_LOCATION` (default `global`), `AGENT_BACKEND=vertex|mock`.
