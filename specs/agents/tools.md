# Agent tools

| Tool | Input | Output |
|------|-------|--------|
| `discover_semantic_model` | — | metrics + dimensions |
| `execute_query_plan` | QueryPlan JSON | AnalyticsResult |
| `update_dashboard` | DashboardSpec or patch | DashboardSpec |
| `persist_trace` | steps[] | trace id |

Tools are implemented in-process in `src/server/agent/analytics-agent.ts` and the analytics/dashboard modules.
