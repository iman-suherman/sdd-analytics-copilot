import { getSqlite } from "../database/client";
import { compileQueryPlan } from "./compiler";
import type { QueryPlan } from "./query-plan";
import { QueryPlanSchema } from "./query-plan";
import { loadSemanticModel } from "./semantic-loader";
import { validateQueryPlan } from "./validate";

export type Evidence = {
  metric: string;
  metricDefinition: string;
  filters: string[];
  timeWindow: { start: string; end: string; label: string } | null;
  comparisonWindow: { start: string; end: string; label: string } | null;
  sql: string;
  params: unknown[];
};

export type ChartRecommendation = {
  type: "kpi" | "line" | "bar" | "table";
  metric: string;
  dimension?: string;
  granularity?: "day" | "week" | "month";
};

export type AnalyticsResult = {
  plan: QueryPlan;
  rows: Record<string, unknown>[];
  value: number | null;
  comparisonValue: number | null;
  deltaPct: number | null;
  evidence: Evidence;
  visualisation: ChartRecommendation;
};

function metricValue(rows: Record<string, unknown>[], metricId: string): number | null {
  if (!rows.length) return 0;
  if (rows.length === 1 && metricId in rows[0]!) {
    const v = rows[0]![metricId];
    return typeof v === "number" ? v : Number(v);
  }
  // calculated AOV
  if (metricId === "average_order_value" && rows.length === 1) {
    const revenue = Number(rows[0]!.revenue ?? 0);
    const orders = Number(rows[0]!.orders ?? 0);
    return orders === 0 ? 0 : revenue / orders;
  }
  return null;
}

function recommendChart(plan: QueryPlan): ChartRecommendation {
  if (plan.time?.granularity) {
    return {
      type: "line",
      metric: plan.metric,
      dimension: plan.time.dimension ?? "order_date",
      granularity: plan.time.granularity,
    };
  }
  if (plan.dimensions.length === 1) {
    return { type: "bar", metric: plan.metric, dimension: plan.dimensions[0] };
  }
  if (plan.dimensions.length === 0) {
    return { type: "kpi", metric: plan.metric };
  }
  return { type: "table", metric: plan.metric };
}

export function executeQueryPlan(
  rawPlan: unknown,
  options: { companyId?: string } = {},
): AnalyticsResult {
  const model = loadSemanticModel();
  const plan = validateQueryPlan(QueryPlanSchema.parse(rawPlan), model);
  const companyId = options.companyId;
  const compiled = compileQueryPlan(plan, model, { companyId });
  const db = getSqlite();

  const stmt = db.prepare(compiled.sql);
  const rows = stmt.all(...compiled.params) as Record<string, unknown>[];

  let comparisonRows: Record<string, unknown>[] = [];
  let comparisonCompiledSql = "";
  let comparisonParams: unknown[] = [];
  if (plan.comparison === "previous_period" && compiled.comparisonWindow) {
    const comparisonCompiled = compileQueryPlan(plan, model, {
      comparison: true,
      companyId,
    });
    comparisonCompiledSql = comparisonCompiled.sql;
    comparisonParams = comparisonCompiled.params;
    comparisonRows = db.prepare(comparisonCompiled.sql).all(
      ...comparisonCompiled.params,
    ) as Record<string, unknown>[];
  }

  // Post-process calculated metric rows
  const normalizedRows = rows.map((row) => {
    if (plan.metric === "average_order_value") {
      const revenue = Number(row.revenue ?? 0);
      const orders = Number(row.orders ?? 0);
      return {
        ...row,
        average_order_value: orders === 0 ? 0 : revenue / orders,
      };
    }
    return row;
  });

  const value = metricValue(normalizedRows, plan.metric);
  const comparisonValue =
    plan.comparison === "previous_period"
      ? metricValue(
          comparisonRows.map((row) => {
            if (plan.metric === "average_order_value") {
              const revenue = Number(row.revenue ?? 0);
              const orders = Number(row.orders ?? 0);
              return {
                ...row,
                average_order_value: orders === 0 ? 0 : revenue / orders,
              };
            }
            return row;
          }),
          plan.metric,
        )
      : null;

  const deltaPct =
    value != null && comparisonValue != null && comparisonValue !== 0
      ? ((value - comparisonValue) / comparisonValue) * 100
      : null;

  const metricDef = model.metrics[plan.metric]!;
  const evidence: Evidence = {
    metric: plan.metric,
    metricDefinition:
      metricDef.description ??
      `${metricDef.label} (${metricDef.type}${metricDef.field ? `: ${metricDef.field}` : ""})`,
    filters: (metricDef.filters ?? []).map(
      (f) => `${f.field} ${f.op} ${JSON.stringify(f.value)}`,
    ),
    timeWindow: compiled.window,
    comparisonWindow: compiled.comparisonWindow,
    sql: compiled.sql,
    params: compiled.params,
  };

  // Attach comparison SQL into evidence when present
  if (comparisonCompiledSql) {
    evidence.sql = `${compiled.sql}\n\n-- comparison period\n${comparisonCompiledSql}`;
    evidence.params = [...compiled.params, ...comparisonParams];
  }

  return {
    plan,
    rows: normalizedRows,
    value,
    comparisonValue,
    deltaPct,
    evidence,
    visualisation: recommendChart(plan),
  };
}
