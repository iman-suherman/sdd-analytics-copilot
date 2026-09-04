# Domain: Company

## Entity

```ts
{
  id: string;      // e.g. "tokoraya"
  name: string;
  slug: string;
  sector: string;
  tagline: string;
}
```

## Tenants (demo)

See SDD-002 / SDD-009. Logos: `/public/companies/{id}.svg`.

## Request scoping

- Header: `x-company-id`
- Parsed by `companyIdFromRequest` in `src/server/company/service.ts`
- Default: `DEFAULT_COMPANY_ID = "tokoraya"`

## Isolation rules

| Resource | Scope |
|----------|--------|
| analytics execute | `WHERE … company_id = ?` |
| conversations / messages | conversation.company_id |
| dashboards | row id `{companyId}__{specId}` |
| agent_traces | company_id column |

LLM QueryPlan MUST NOT be allowed to override the request company.
