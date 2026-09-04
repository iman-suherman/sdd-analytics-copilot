# Specs

This directory is the source of truth for **Spec-Driven Development** in this repository.

Trace any capability:

```
Requirement (specs/requirements/)
        ↓
Domain / API / Agent contracts
        ↓
Implementation (src/)
        ↓
Acceptance tests (tests/)
        ↓
Runtime agent traces (UI → Trace)
```

## Layout

| Path | Purpose |
|------|---------|
| `product/` | Vision, personas, demo journey |
| `requirements/` | SHALL requirements with stable IDs (`SDD-00x`) |
| `domain/` | Semantic model, QueryPlan, conversation, dashboard contracts |
| `api/` | OpenAPI surface |
| `agents/` | Analytics agent behaviour and tools |
| `adr/` | Architecture decision records |
| `acceptance/` | Gherkin scenarios |
| `roadmap/` | Implementation phases |

See also `docs/architecture.md` and `docs/demo-script.md`.
