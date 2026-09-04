import type { QueryPlan } from "./query-plan";
import { loadSemanticModel } from "./semantic-loader";
import type { MetricDef, SemanticModel } from "./semantic-schema";
import { previousPeriodWindow, resolveTimeRange, type ResolvedWindow } from "./time-range";

export type CompiledQuery = {
  sql: string;
  params: unknown[];
  window: ResolvedWindow | null;
  comparisonWindow: ResolvedWindow | null;
  metricId: string;
  dimensions: string[];
};

const TABLE_ALIASES: Record<string, string> = {
  orders: "o",
  customers: "c",
  products: "p",
  order_items: "oi",
};

function qualify(field: string): string {
  const [table, col] = field.split(".");
  const alias = TABLE_ALIASES[table!] ?? table;
  return `${alias}.${col}`;
}

function requiredJoins(
  fields: string[],
): { sql: string; needed: Set<string> } {
  const needed = new Set<string>(["orders"]);
  for (const f of fields) {
    const table = f.split(".")[0]!;
    needed.add(table);
  }

  // order_items implies products often; ensure path
  if (needed.has("products") || needed.has("order_items")) {
    needed.add("order_items");
    needed.add("orders");
  }
  if (needed.has("customers")) {
    needed.add("orders");
  }

  const parts: string[] = ["FROM orders o"];
  if (needed.has("customers")) {
    parts.push("JOIN customers c ON o.customer_id = c.id");
  }
  if (needed.has("order_items")) {
    parts.push("JOIN order_items oi ON oi.order_id = o.id");
  }
  if (needed.has("products")) {
    parts.push("JOIN products p ON oi.product_id = p.id");
  }

  return { sql: parts.join("\n"), needed };
}

function metricExpression(metric: MetricDef, metricId: string): string {
  if (metric.type === "calculated") {
    throw new Error(`Calculated metric ${metricId} must be expanded before compile`);
  }
  const field = qualify(metric.field!);
  switch (metric.type) {
    case "sum":
      return `SUM(${field})`;
    case "avg":
      return `AVG(${field})`;
    case "count":
      return `COUNT(${field})`;
    case "count_distinct":
      return `COUNT(DISTINCT ${field})`;
    default:
      throw new Error(`Unsupported metric type ${(metric as MetricDef).type}`);
  }
}

function expandCalculated(
  metricId: string,
  model: SemanticModel,
): { parts: { id: string; expr: string; def: MetricDef }[]; formula: string } {
  const metric = model.metrics[metricId]!;
  if (metric.type !== "calculated" || !metric.formula) {
    return {
      parts: [{ id: metricId, expr: metricExpression(metric, metricId), def: metric }],
      formula: metricId,
    };
  }
  const tokens = metric.formula.match(/[a-z_]+/gi) ?? [];
  const parts = tokens
    .filter((t) => model.metrics[t])
    .map((id) => {
      const def = model.metrics[id]!;
      return { id, expr: metricExpression(def, id), def };
    });
  return { parts, formula: metric.formula };
}

function collectFields(plan: QueryPlan, model: SemanticModel): string[] {
  const fields: string[] = [];
  const metric = model.metrics[plan.metric]!;
  if (metric.type === "calculated" && metric.formula) {
    for (const token of metric.formula.match(/[a-z_]+/gi) ?? []) {
      const m = model.metrics[token];
      if (m?.field) fields.push(m.field);
      for (const f of m?.filters ?? []) fields.push(f.field);
    }
  } else if (metric.field) {
    fields.push(metric.field);
  }
  for (const f of metric.filters ?? []) fields.push(f.field);

  for (const dim of plan.dimensions) {
    fields.push(model.dimensions[dim]!.field);
  }
  for (const filter of plan.filters ?? []) {
    fields.push(model.dimensions[filter.dimension]!.field);
  }
  if (plan.time?.dimension) {
    fields.push(model.dimensions[plan.time.dimension]!.field);
  }
  return fields;
}

function buildWhere(
  plan: QueryPlan,
  model: SemanticModel,
  window: ResolvedWindow | null,
  params: unknown[],
  companyId?: string,
): string {
  const clauses: string[] = [];

  if (companyId) {
    clauses.push(`o.company_id = ?`);
    params.push(companyId);
  }

  const metric = model.metrics[plan.metric]!;
  const metricsToFilter =
    metric.type === "calculated" && metric.formula
      ? (metric.formula.match(/[a-z_]+/gi) ?? [])
          .map((id) => model.metrics[id])
          .filter(Boolean)
      : [metric];

  const seenFilterKeys = new Set<string>();
  for (const m of metricsToFilter) {
    for (const f of m!.filters ?? []) {
      const key = `${f.field}:${f.op}:${f.value}`;
      if (seenFilterKeys.has(key)) continue;
      seenFilterKeys.add(key);
      const q = qualify(f.field);
      if (f.op === "eq") {
        clauses.push(`${q} = ?`);
        params.push(f.value);
      } else if (f.op === "in" && Array.isArray(f.value)) {
        clauses.push(`${q} IN (${f.value.map(() => "?").join(", ")})`);
        params.push(...f.value);
      }
    }
  }

  for (const filter of plan.filters ?? []) {
    const field = qualify(model.dimensions[filter.dimension]!.field);
    if (filter.op === "eq") {
      clauses.push(`${field} = ?`);
      params.push(filter.value);
    } else if (filter.op === "in") {
      const values = Array.isArray(filter.value) ? filter.value : [filter.value];
      clauses.push(`${field} IN (${values.map(() => "?").join(", ")})`);
      params.push(...values);
    } else if (filter.op === "neq") {
      clauses.push(`${field} <> ?`);
      params.push(filter.value);
    }
  }

  if (window && plan.time?.dimension) {
    const field = qualify(model.dimensions[plan.time.dimension]!.field);
    clauses.push(`${field} >= ?`);
    params.push(window.start);
    clauses.push(`${field} < ?`);
    params.push(window.end);
  } else if (plan.time?.start || plan.time?.end) {
    const field = qualify(
      model.dimensions[plan.time.dimension ?? "order_date"]!.field,
    );
    if (plan.time.start) {
      clauses.push(`${field} >= ?`);
      params.push(plan.time.start);
    }
    if (plan.time.end) {
      clauses.push(`${field} < ?`);
      params.push(plan.time.end);
    }
  }

  return clauses.length ? `WHERE ${clauses.join("\n  AND ")}` : "";
}

function timeBucketExpr(field: string, granularity: "day" | "week" | "month") {
  if (granularity === "month") return `substr(${field}, 1, 7)`;
  if (granularity === "week") return `strftime('%Y-W%W', ${field})`;
  return `substr(${field}, 1, 10)`;
}

export function compileQueryPlan(
  plan: QueryPlan,
  model: SemanticModel = loadSemanticModel(),
  options: { comparison?: boolean; companyId?: string } = {},
): CompiledQuery {
  const window =
    plan.time?.start && plan.time?.end
      ? { start: plan.time.start, end: plan.time.end, label: "custom" }
      : resolveTimeRange(plan.time?.range);

  const comparisonWindow =
    options.comparison || plan.comparison === "previous_period"
      ? window
        ? previousPeriodWindow(window)
        : null
      : null;

  const activeWindow = options.comparison ? comparisonWindow : window;
  const params: unknown[] = [];
  const fields = collectFields(plan, model);
  const { sql: fromSql } = requiredJoins(fields);

  const selectParts: string[] = [];
  const groupParts: string[] = [];

  const granularity = plan.time?.granularity;
  if (granularity && plan.time?.dimension) {
    const timeField = qualify(model.dimensions[plan.time.dimension]!.field);
    const bucket = timeBucketExpr(timeField, granularity);
    selectParts.push(`${bucket} AS ${plan.time.dimension}`);
    groupParts.push(bucket);
  }

  for (const dim of plan.dimensions) {
    const field = qualify(model.dimensions[dim]!.field);
    selectParts.push(`${field} AS ${dim}`);
    groupParts.push(field);
  }

  const expanded = expandCalculated(plan.metric, model);
  if (expanded.parts.length === 1 && model.metrics[plan.metric]!.type !== "calculated") {
    selectParts.push(`${expanded.parts[0]!.expr} AS ${plan.metric}`);
  } else {
    for (const part of expanded.parts) {
      selectParts.push(`${part.expr} AS ${part.id}`);
    }
  }

  const where = buildWhere(plan, model, activeWindow, params, options.companyId);
  const groupBy = groupParts.length ? `GROUP BY ${groupParts.join(", ")}` : "";
  const limit = plan.limit ? `LIMIT ${plan.limit}` : "";

  const sql = [
    `SELECT`,
    `  ${selectParts.join(",\n  ")}`,
    fromSql,
    where,
    groupBy,
    limit,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    sql,
    params,
    window: activeWindow,
    comparisonWindow,
    metricId: plan.metric,
    dimensions: [
      ...(granularity && plan.time?.dimension ? [plan.time.dimension] : []),
      ...plan.dimensions,
    ],
  };
}
