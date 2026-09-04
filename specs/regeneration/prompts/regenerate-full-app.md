# Prompt: regenerate the full application

> **Prefer the single entrypoint:** [`REGENERATE.md`](./REGENERATE.md) (parallel waves + inventory).  
> This file remains as a condensed sequential checklist.

Copy everything below the line into a coding agent that has this repository’s **`specs/`**, **`semantic/`**, and ideally **`data/samples/`** available (even if `src/` was deleted).

---

You are regenerating **sdd-analytics-copilot** from Spec-Driven Development specs alone.

## Mission

Rebuild the complete Next.js monolith demo so it matches `specs/regeneration/README.md` and all requirements `SDD-001` … `SDD-013`. Do not invent a different architecture.

## Hard constraints (must not violate)

1. LLM never executes or authors SQL — only `QueryPlan` → validate → compile → execute.
2. Dashboards are JSON `DashboardSpec`s, not generated React components.
3. Keep a **single** Next.js + SQLite monolith.
4. Fix analytics “today” at **`2026-09-05`** (`DEMO_AS_OF`).
5. Soft multi-tenancy: six Indonesian fictional companies; scope via `company_id` and header `x-company-id`.
6. Primary UI + Copilot answers in **Bahasa Indonesia**; decline region is **Sumatera** (not APAC); currency IDR.
7. Prefer seeding from `data/samples/**` CSVs with **sector-specific column names** mapped in `data/csv-profiles.ts`.

## Read these specs first

- `specs/product/vision.md`, `demo-journey.md`
- `specs/requirements/SDD-001` through `SDD-013`
- `specs/domain/*` (company, query-plan, semantic-model, time-range, csv-profiles, dashboard, conversation)
- `specs/agents/analytics-agent.md`, `tools.md`
- `specs/api/openapi.yaml`
- `specs/adr/ADR-001` … `ADR-007`
- `specs/regeneration/README.md`

## Deliverables

### A. Tooling & data

- Recreate `package.json` scripts: `demo`, `db:seed`, `db:seed:generate`, `data:export-csv`, `login`, `generate-env`, `test`
- Implement `data/seed.ts`, `csv-io.ts`, `csv-profiles.ts`, `export-csv.ts`
- If `data/samples/` missing: generate then `data:export-csv`
- Implement `scripts/gcp-adc-login.cjs` + helpers (`gcp-config`, `gcp-lib-adc`, prompts, `generate-env`, `terminal-colors`) matching SDD-013 (default project `personal-suherman`)

### B. Server

- Drizzle/SQLite schema with companies + company-scoped tables
- Analytics: query-plan Zod, validate, compiler (inject company_id), execute, time-range, semantic loader for `semantic/commerce.yaml`
- Agent: `analytics-agent` router; `mock-agent`; `vertex-agent` + `@google/genai` Vertex client; fallback to mock
- Dashboard service + patches; traces service; company service
- API routes: `/api/companies`, `/api/analytics/query`, `/api/agent/chat`, `/api/dashboards`, `/api/semantic-model`, `/api/traces` — honor `x-company-id`

### C. UI

- App nav + company modal switcher
- Global floating Copilot dock: bubble, resize, fullscreen below header, Escape, typewriter answers, immediate charts
- Pages: home (Bahasa flow cards → `ask(prompt)`), dashboards, semantic-model, traces
- Deep-link `/copilot?q=` opens dock and redirects home

### D. Quality

- Vitest acceptance/integration/evals with `AGENT_BACKEND=mock`
- `AGENTS.md` north-star + commands
- `.env.example` with GCP/Vertex keys (no secrets committed)
- `.gitignore`: `.env*`, `.gcloud/application_default_credentials.json`, `data/demo.sqlite`

## Demo proof

After `npm run demo` (and optional `npm run login`):

1. TokoRaya — “Bagaimana pendapatan bulan lalu dibanding bulan sebelumnya?”
2. “Kenapa Sumatera turun?”
3. “Tambahkan investigasi ini ke dasbor eksekutif.”
4. “Ganti wilayah dengan segmen pelanggan.”

## Working style

Prefer changing specs only when contracts must expand; otherwise implement behind existing contracts. Keep the demo journey working end-to-end before polishing.
