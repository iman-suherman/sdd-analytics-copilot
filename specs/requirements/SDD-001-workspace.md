# SDD-001 Workspace

## Requirement

The system SHALL provide a single-repo Next.js web application with:

| Surface | Route / entry | Purpose |
|---------|---------------|---------|
| Beranda | `/` | Hero + clickable SDD demo flow cards (open Kopilot) |
| Kopilot | Floating dock (global) + legacy `/copilot?q=` deep-link | Conversational analytics |
| Dasbor | `/dashboards` | Declarative DashboardSpec renderer |
| Model Semantik | `/semantic-model` | Metrics/dimensions + spec traces |
| Jejak | `/traces` | Runtime agent steps + SQL |

The workspace SHALL:

- Load against local SQLite (`data/demo.sqlite`) without cloud data warehouses
- Show a **company switcher** in the app header (`x-company-id` for API calls)
- Host a **bottom-right Copilot bubble** that expands into a resizable / fullscreen panel while keeping the app header visible
- Use **Bahasa Indonesia** for primary UI chrome and Copilot answers

## Commands

```bash
npm install
npm run login          # optional — Vertex ADC
npm run demo           # db:seed + next dev
```

## Acceptance

- Given a fresh clone with dependencies installed
- When the operator runs `npm run demo`
- Then `/`, `/dashboards`, `/semantic-model`, `/traces` are reachable
- And the Copilot bubble appears bottom-right on every page
- And switching company changes which tenant’s data is queried
