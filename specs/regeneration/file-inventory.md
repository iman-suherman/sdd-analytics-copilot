# File inventory (regenerate these)

Exact paths the parallel agents must recreate. Contracts marked ★ copy from `specs/regeneration/contracts/` (rename `.ts.txt` → `.ts`).

## data/
- data/csv-io.ts
- data/csv-profiles.ts
- data/export-csv.ts
- data/seed.ts  (export `seedDatabase(dbPath?: string)`)

## scripts/
- scripts/gcp-adc-login.cjs
- scripts/gcp-config.cjs
- scripts/gcp-lib-adc.cjs
- scripts/prompt-gcp-email.cjs
- scripts/prompt-gcp-project.cjs
- scripts/generate-env.cjs
- scripts/terminal-colors.cjs

## src/server/database/
- src/server/database/schema.ts ★
- src/server/database/client.ts
- src/server/database/ensure.ts

## src/server/company/
- src/server/company/service.ts

## src/server/analytics/
- src/server/analytics/query-plan.ts ★
- src/server/analytics/time-range.ts ★
- src/server/analytics/semantic-schema.ts
- src/server/analytics/semantic-loader.ts
- src/server/analytics/validate.ts
- src/server/analytics/compiler.ts
- src/server/analytics/execute.ts
- src/server/analytics/index.ts

## src/server/dashboard/
- src/server/dashboard/schema.ts ★
- src/server/dashboard/service.ts

## src/server/traces/
- src/server/traces/service.ts

## src/server/gcp/
- src/server/gcp/credentials.ts

## src/server/agent/
- src/server/agent/analytics-agent.ts
- src/server/agent/mock-agent.ts
- src/server/agent/vertex-agent.ts
- src/server/agent/vertex-client.ts
- src/server/agent/vertex-llm.ts

## src/app/api/
- src/app/api/companies/route.ts
- src/app/api/analytics/query/route.ts
- src/app/api/agent/chat/route.ts
- src/app/api/dashboards/route.ts
- src/app/api/semantic-model/route.ts
- src/app/api/traces/route.ts

## src/app pages
- src/app/layout.tsx
- src/app/page.tsx
- src/app/globals.css
- src/app/copilot/page.tsx
- src/app/dashboards/page.tsx
- src/app/semantic-model/page.tsx
- src/app/traces/page.tsx

## src/components/
- src/components/layout/AppNav.tsx
- src/components/company/CompanyProvider.tsx
- src/components/company/CompanySelect.tsx
- src/components/copilot/CopilotProvider.tsx
- src/components/copilot/CopilotDock.tsx
- src/components/copilot/CopilotChat.tsx
- src/components/home/HomeHero.tsx
- src/components/dashboard/DashboardView.tsx
- src/components/semantic/SemanticModelView.tsx
- src/components/trace/TraceExplorer.tsx
- src/components/charts/ResultChart.tsx

## src/lib/
- src/lib/utils.ts
- src/lib/chart-theme.ts
- src/lib/company-logos.ts
- src/lib/company-prompts.ts

## tests/
- tests/acceptance/SDD-004.test.ts
- tests/acceptance/SDD-007.test.ts
- tests/integration/query-plan.test.ts
- tests/evals/demo-prompts.test.ts
