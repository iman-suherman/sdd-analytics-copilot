# Regeneration blueprint

**Purpose:** If `src/`, `scripts/`, `data/seed.ts`, and UI are deleted, an implementer (human or coding agent) can rebuild the **full** SDD Analytics Copilot from this specs tree.

**Read order**

1. `specs/product/vision.md` + `demo-journey.md` + `personas.md`
2. All `specs/requirements/SDD-*.md` (001–013)
3. `specs/domain/*`, `specs/agents/*`, `specs/api/openapi.yaml`
4. `specs/adr/*`
5. `specs/regeneration/prompts/*` (copy-paste into a coding agent)
6. Keep `semantic/commerce.yaml` and `data/samples/**` if present; otherwise regenerate samples per SDD-011 after a procedural seed

## Non-negotiable invariants

1. **No arbitrary SQL from the LLM** — QueryPlan → validate → compile → execute only (SDD-004/005, ADR-003/007).
2. **Dashboards are JSON specs**, not generated React trees (ADR-004).
3. **Monolith** — Next.js App Router + SQLite (ADR-001/002).
4. **Demo clock** `2026-09-05` (SDD-010, ADR-006).
5. **Soft multi-tenancy** via `company_id` + `x-company-id` (SDD-009, ADR-005).
6. **Bahasa Indonesia** UI + Copilot narration (SDD-010).

## Target stack

Next.js 15 (App Router, `src/`), React 19, TypeScript, Tailwind 4, ECharts, better-sqlite3, Drizzle, Zod, Vitest, `@google/genai`, `react-markdown`, lucide-react.

## Module map to regenerate

| Concern | Path |
|---------|------|
| Requirements | `specs/requirements/` |
| Semantic YAML | `semantic/commerce.yaml` |
| QueryPlan pipeline | `src/server/analytics/*` |
| Agent (mock + Vertex) | `src/server/agent/*` |
| GCP credentials | `src/server/gcp/credentials.ts` |
| Company | `src/server/company/service.ts` |
| Dashboard DSL | `src/server/dashboard/*` |
| Traces | `src/server/traces/*` |
| DB schema/client | `src/server/database/*` |
| API routes | `src/app/api/**` |
| Copilot dock UI | `src/components/copilot/*` |
| Company UI | `src/components/company/*` |
| Seed / CSV | `data/seed.ts`, `data/csv-*.ts`, `data/export-csv.ts`, `data/samples/**` |
| GCP login scripts | `scripts/gcp-*.cjs`, `prompt-gcp-*.cjs`, `generate-env.cjs`, `terminal-colors.cjs` |
| Acceptance | `tests/acceptance/`, `tests/integration/`, `tests/evals/` |

## npm scripts to recreate

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "login": "node scripts/gcp-adc-login.cjs",
  "generate-env": "node scripts/generate-env.cjs",
  "db:seed": "tsx data/seed.ts",
  "db:seed:generate": "tsx data/seed.ts --generate",
  "data:export-csv": "tsx data/export-csv.ts",
  "demo": "npm run db:seed && next dev",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Vitest env: `AGENT_BACKEND=mock`.

## Implementation phases (regeneration)

| Phase | Deliverable | Specs |
|-------|-------------|-------|
| A | Monolith shell, nav, company switcher, empty pages | SDD-001, 009 |
| B | Schema + seed CSV/generator + semantic YAML | SDD-002, 003, 011 |
| C | QueryPlan validate/compile/execute + API query | SDD-005, domain/query-plan, time-range |
| D | Mock agent + chat API + traces | SDD-004, 008 |
| E | Dashboards DSL + patches | SDD-007, 006 |
| F | Copilot dock UX (typewriter, resize, fullscreen) | SDD-012 |
| G | Vertex + `npm run login` scripts | SDD-013 |
| H | Acceptance tests + Bahasa demo journey polish | acceptance/*, demo-journey |

## Definition of done

- `npm run demo` boots
- Hero flow cards open dock and run Bahasa prompts
- Sumatera decline diagnosable for TokoRaya
- Dashboard persist + replace widget works
- `npm test` passes with mock backend
- `npm run login` documented and functional when gcloud present
- `npm run data:export-csv` / `db:seed` round-trip works
