# ADR-005 Soft multi-tenant demo

## Decision

Use **one SQLite file** with `company_id` columns and a client header `x-company-id` for demo multi-tenancy.

## Consequences

- Simple `npm run demo` story
- Not a substitute for real authz / row-level security products
- Specs and tests must assert tenant isolation on analytics and dashboards
