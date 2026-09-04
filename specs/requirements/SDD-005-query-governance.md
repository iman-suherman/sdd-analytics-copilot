# SDD-005 Query governance

## Requirement

The analytics engine SHALL accept only validated QueryPlan objects.

The engine SHALL compile QueryPlans into parameterised SQLite SQL.

The engine SHALL reject unknown metrics, dimensions, and illegal time dimensions.

## QueryPlan (example)

```json
{
  "metric": "revenue",
  "dimensions": ["region"],
  "time": { "dimension": "order_date", "range": "last_month" },
  "comparison": "previous_period"
}
```
