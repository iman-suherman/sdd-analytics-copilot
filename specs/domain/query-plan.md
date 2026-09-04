# Domain: QueryPlan

Validated by Zod `QueryPlanSchema` in `src/server/analytics/query-plan.ts`.

```ts
{
  metric: string;                    // semantic metric id
  dimensions: string[];              // semantic dimension ids
  filters: { dimension, op: "eq"|"neq"|"in", value: string|string[] }[];
  time?: {
    dimension: string;               // usually "order_date"
    range?: TimeRange;
    start?: string; end?: string;
    granularity?: "day"|"week"|"month";
  };
  comparison?: "previous_period"|"none";
  limit?: number;                    // max 1000
}
```

## Pipeline

1. Agent emits QueryPlan JSON (Vertex or mock) — **never SQL**
2. `validate` against semantic model
3. `compile` → parameterised SQL **plus** injected `company_id = ?`
4. `execute` on SQLite → rows, value, deltaPct, evidence, visualisation hint

## Evidence

Every successful analytics answer SHOULD include:

- metric definition text
- compiled SQL
- bound params
- time window `{ start, end }`
