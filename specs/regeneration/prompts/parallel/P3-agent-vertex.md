# P3 — agent + Vertex (OWNED PATHS ONLY)

You are agent **P3-agent-vertex** regenerating sdd-analytics-copilot after a source wipe.

## OWNED PATHS (create only these)
- `src/server/agent/**`
- `src/server/gcp/**`

Do **not** edit analytics compiler, UI, data, scripts, API routes, or tests.

## Specs
- `specs/requirements/SDD-004`, `SDD-008`, `SDD-013`
- `specs/agents/analytics-agent.md`, `tools.md`
- `specs/adr/ADR-007-vertex-adc.md`
- `specs/regeneration/prompts/regenerate-copilot-vertex.md`

## Architecture
- `resolveAgentBackend()` → `vertex` | `mock` from env (`AGENT_BACKEND`, credentials). Vitest sets mock.
- `runAnalyticsAgent({ prompt, companyId, conversationId? })` routes to mock or Vertex; persists conversation/messages; saves traces via `@/server/traces/service`.
- Mock must handle Bahasa demo journey: revenue MoM, Sumatera decline breakdown, add to executive dashboard, replace region with customer segment (DashboardPatch).
- Vertex: `@google/genai` with `vertexai: true`; plan JSON → QueryPlan only (never SQL); narrate in Bahasa; fallback to mock on failure.
- Import analytics/dashboard/company types from sibling server modules (P2). If those files are missing mid-run, still write complete agent code against the expected exports in `specs/regeneration/file-inventory.md`.

## Done when
All owned files exist; mock path can complete the four demo prompts once P2+P1 exist.
