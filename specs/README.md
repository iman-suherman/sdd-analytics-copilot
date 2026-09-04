# Specs

This directory is the **source of truth** for Spec-Driven Development in this repository.

If application code is deleted, regenerate from:

1. This tree (`requirements` → `domain` → `agents` → `api` → `adr`)
2. `specs/regeneration/README.md` (blueprint)
3. `specs/regeneration/prompts/*` (copy-paste agent prompts)
4. `semantic/commerce.yaml` + `data/samples/**` when available

## Traceability

```
Requirement (specs/requirements/SDD-xxx)
        ↓
Domain / API / Agent contracts
        ↓
Implementation (src/, data/, scripts/)
        ↓
Acceptance tests (tests/) + Gherkin (specs/acceptance/)
        ↓
Runtime agent traces (UI → Jejak)
```

## Layout

| Path | Purpose |
|------|---------|
| `product/` | Vision, personas, Bahasa demo journey |
| `requirements/` | SHALL requirements `SDD-001` … `SDD-013` |
| `domain/` | Company, QueryPlan, semantic model, time-range, CSV profiles, dashboard, conversation |
| `api/` | OpenAPI (`x-company-id`, companies, chat, query, …) |
| `agents/` | Analytics agent + tools (Vertex/mock) |
| `adr/` | Architecture decisions (monolith, SQLite, QueryPlan, dashboard DSL, tenancy, locale, Vertex) |
| `acceptance/` | Gherkin scenarios |
| `roadmap/` | Implementation / regeneration phases |
| `regeneration/` | Blueprint + prompts to rebuild the full app |

## Requirement index

| ID | Title |
|----|-------|
| SDD-001 | Workspace (surfaces, dock, company switcher) |
| SDD-002 | Demo dataset (6 companies, Sumatera decline) |
| SDD-003 | Semantic model |
| SDD-004 | Analytics copilot |
| SDD-005 | Query governance |
| SDD-006 | Visualisation |
| SDD-007 | Dashboard DSL |
| SDD-008 | Agent trace |
| SDD-009 | Multi-tenant companies |
| SDD-010 | Locale + demo clock |
| SDD-011 | CSV seed pipeline |
| SDD-012 | Copilot dock UX |
| SDD-013 | Vertex AI + GCP ops scripts |

See also `docs/architecture.md`, `docs/demo-script.md`, and root `AGENTS.md`.
