# Domain: QueryPlan

Intermediate object between natural language and SQL.

```ts
{
  metric: string;
  dimensions: string[];
  filters?: { dimension: string; op: "eq" | "neq" | "in"; value: string | string[] }[];
  time?: {
    dimension: string; // must be type: time
    range?: "last_month" | "last_6_months" | ...;
    start?: string;
    end?: string;
    granularity?: "day" | "week" | "month";
  };
  comparison?: "previous_period" | "none";
  limit?: number;
}
```

Validated by Zod (`src/server/analytics/query-plan.ts`), compiled by `compiler.ts`, executed by `execute.ts`.
