# Agent tools

In-process tools used by the analytics agent (mock or Vertex-orchestrated).

| Tool | Input | Output | Notes |
|------|-------|--------|-------|
| `discover_semantic_model` | — | metrics + dimensions | From `commerce.yaml` |
| `execute_query_plan` | QueryPlan JSON + `companyId` | AnalyticsResult | Validate → compile (inject company_id) → SQLite |
| `update_dashboard` | DashboardSpec or DashboardPatch + `companyId` | DashboardSpec | Structured ops only |
| `persist_trace` | steps[] + ids | trace id | Include backend vertex\|mock |

Vertex planning emits an `AgentPlan` (`intent`, `queryPlan?`, `breakdowns?`, `dashboardPatch?`) which the runtime maps onto these tools — the model never calls SQLite directly.
