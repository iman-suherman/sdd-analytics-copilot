# SDD-009 Multi-tenant companies

## Requirement

The system SHALL soft-isolate analytics, chat, dashboards, and traces by **company**.

### Data

- `companies(id, name, slug, sector, tagline)`
- All commerce + conversation + dashboard + trace rows carry `company_id` (FK)

### API / client

- Client SHALL send header **`x-company-id: <id>`** on API requests (`companyFetch`)
- Server SHALL default to `tokoraya` if header missing (demo convenience)
- `GET /api/companies` SHALL list tenants for the company switcher

### UI

- Header **CompanySelect** (modal) shows name, sector, tagline, logo
- Changing company resets Copilot conversation context for that tenant
- Demo prompt cards SHALL be company-aware (`src/lib/company-prompts.ts`)

### Query governance

Compiled SQL for analytics SHALL include a bound `company_id` predicate (never trust client-supplied company in the LLM plan alone — inject from request context).

## Acceptance

- Given two companies A and B with different August revenue
- When the same QueryPlan metric `revenue` / `last_month` runs for each
- Then result values differ and evidence SQL contains `company_id`
- And dashboards listed for A are not returned for B
