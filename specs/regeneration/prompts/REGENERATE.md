# SINGLE PROMPT — regenerate the entire app

**Copy everything below the horizontal rule into one Cursor / VS Code Agent chat** (or run `bash specs/regeneration/run-parallel.sh` after `agent login`).

This is the **only** prompt you need. Specs, contracts, samples, and package configs are already in the repo; application source (`src/`, `scripts/`, `data/*.ts`, `tests/`) may be missing on purpose.

---

You are regenerating **sdd-analytics-copilot** from Spec-Driven Development specs alone. Finish in **under 30 minutes**. Prefer **parallel multi-agents** with exclusive path ownership; if you are a single agent, execute the same waves sequentially without skipping files.

## Mission

Rebuild the complete Next.js + SQLite monolith so it matches `specs/regeneration/README.md` and requirements **SDD-001 … SDD-013**. Do not invent a different architecture.

## Hard constraints (never violate)

1. LLM never writes or runs SQL — only `QueryPlan` → validate → compile → execute (compiler injects `company_id`).
2. Dashboards are JSON `DashboardSpec`s, not generated React trees.
3. Single monolith: Next.js App Router (`src/`) + SQLite (`data/demo.sqlite`).
4. Demo clock fixed: `DEMO_AS_OF = "2026-09-05"` (bulan lalu = Agustus 2026).
5. Soft multi-tenancy: six Indonesian companies; header `x-company-id` (default `tokoraya`).
6. UI + Copilot narration in **Bahasa Indonesia**; decline region **Sumatera** (not APAC); currency IDR.
7. Prefer seeding from existing `data/samples/**` via `data/csv-profiles.ts` sector columns.
8. Keep `package.json` dependencies as-is unless a missing package blocks the build.
9. Copy golden contracts **verbatim** from `specs/regeneration/contracts/*.ts.txt` → matching `src/**/*.ts` (strip `.txt`).

## Read first (in order)

1. `specs/regeneration/orchestrate-parallel.md`
2. `specs/regeneration/file-inventory.md`
3. `specs/regeneration/README.md`
4. `specs/product/vision.md`, `demo-journey.md`
5. `specs/requirements/SDD-001` … `SDD-013`
6. `specs/domain/*`, `specs/agents/*`, `specs/api/openapi.yaml`, `specs/adr/*`
7. Phase prompts under `specs/regeneration/prompts/parallel/P1` … `P6` (follow their OWNED PATHS)

## Execution plan (parallel)

### Wave 1 — launch four agents at once (or do all four yourself in order)

| Agent | Prompt file | Owns only |
|-------|-------------|-----------|
| P1 | `prompts/parallel/P1-data-ops.md` | `data/csv-io.ts`, `csv-profiles.ts`, `export-csv.ts`, `seed.ts`, `scripts/**` |
| P2 | `prompts/parallel/P2-server-core.md` | `src/server/{database,company,analytics,dashboard,traces}/**` |
| P3 | `prompts/parallel/P3-agent-vertex.md` | `src/server/agent/**`, `src/server/gcp/**` |
| P4 | `prompts/parallel/P4-ui.md` | `src/app` pages (not `api`), `src/components/**`, `src/lib/**` |

### Wave 2 — after Wave 1 files exist

| Agent | Prompt file | Owns only |
|-------|-------------|-----------|
| P5 | `prompts/parallel/P5-api.md` | `src/app/api/**` |
| P6 | `prompts/parallel/P6-tests.md` | `tests/**` |

### Wave 3 — verify

```bash
npm run db:seed
npm test
```

Fix any cross-cutting failures. Do not stop until **14** vitest tests pass (or the current suite is green) and seed reports 6 companies.

## Key exports / contracts

- `data/seed.ts` → `seedDatabase(dbPath?: string)`
- `DEMO_AS_OF` in `src/server/analytics/time-range.ts`
- Analytics: `validateQueryPlan` → `compileQueryPlan` → `executeQueryPlan(plan, companyId)`
- Agent: `runAnalyticsAgent({ prompt, companyId, conversationId? })` with mock + Vertex; vitest forces `AGENT_BACKEND=mock`
- Company: `DEFAULT_COMPANY_ID = "tokoraya"`, `companyIdFromRequest`
- Copilot dock: floating UI, typewriter, resize, fullscreen below header, `ask(prompt)` from home cards
- API: OpenAPI paths for companies, analytics/query, agent/chat, dashboards, semantic-model, traces

## Demo proof (after `npm run demo`)

1. TokoRaya — “Bagaimana pendapatan bulan lalu dibanding bulan sebelumnya?”
2. “Kenapa Sumatera turun?”
3. “Tambahkan investigasi ini ke dasbor eksekutif.”
4. “Ganti wilayah dengan segmen pelanggan.”

## Done when

- [ ] All paths in `specs/regeneration/file-inventory.md` exist
- [ ] `npm run db:seed` succeeds from CSV samples
- [ ] `npm test` passes with mock backend
- [ ] QueryPlan boundary intact (`company_id` in evidence SQL)
- [ ] Bahasa Indonesia UI + Copilot dock wired

Start Wave 1 now.
