# Prompt: regenerate Copilot dock + Vertex agent

Use when analytics/SQL core exists but chat UX / Vertex wiring is missing.

---

Implement SDD-012 and SDD-013 plus `specs/agents/analytics-agent.md`.

## Copilot UX

- `CopilotProvider` with `open`, `ask(prompt?)`, `pendingPrompt`
- `CopilotDock`: bottom-right bubble; resizable floating panel; fullscreen under app header; Escape; deep-link `/copilot?q=`
- `CopilotChat`: Bahasa demo chips per company; typewriter assistant markdown; charts/evidence immediate; typing indicator while pending

## Agent

- Router chooses Vertex vs mock via ADC + `GCP_PROJECT_ID` / `AGENT_BACKEND`
- Vertex: structured AgentPlan JSON → execute QueryPlans with request `companyId` → narrate Bahasa
- Mock: deterministic regex intents for demo journey (compare, Sumatera, dashboard, replace widget)
- Always persist traces; never LLM SQL

## Verify

- Mock: `AGENT_BACKEND=mock` + acceptance tests
- Vertex (if logged in): trace shows `vertex_plan` / `backend: "vertex"`
