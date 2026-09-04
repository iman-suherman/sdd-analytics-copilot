# SDD-005 Query governance

## Requirement

The analytics engine SHALL accept only validated QueryPlan objects.

The engine SHALL compile QueryPlans into parameterised SQLite SQL.

The engine SHALL reject unknown metrics, dimensions, and illegal time dimensions.

The compiler SHALL **always** bind the active request `company_id` into SQL (soft multi-tenancy). The LLM MUST NOT supply or override company scope.

## QueryPlan (example)

```json
{
  "metric": "revenue",
  "dimensions": ["region"],
  "time": { "dimension": "order_date", "range": "last_month" },
  "comparison": "previous_period"
}
```

## Evidence

Successful executions SHALL return metric definition, SQL, params, and time window for the Trace / Copilot UI.
