# Architecture

Monolithic Next.js App Router application:

- **UI** — Copilot, Dashboard, Semantic Model, Trace
- **API routes** — thin adapters over server modules
- **Agent** — intent → QueryPlan / DashboardPatch → tools
- **Analytics** — validate → compile → SQLite
- **Persistence** — SQLite (`data/demo.sqlite`)

```
User prompt
   → analytics-agent
   → QueryPlan (Zod)
   → validate + compile
   → better-sqlite3
   → answer + evidence + chart + trace
```

See ADRs under `specs/adr/`.
