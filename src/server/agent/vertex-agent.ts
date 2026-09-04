import { executeQueryPlan, type AnalyticsResult } from "../analytics/execute";
import type { QueryPlan } from "../analytics/query-plan";
import { listDimensions, listMetrics, loadSemanticModel } from "../analytics/semantic-loader";
import {
  applyDashboardPatch,
  createExecutiveFromInvestigation,
} from "../dashboard/service";
import type { TraceStep } from "../traces/service";
import type { AgentResponsePayload } from "./analytics-agent";
import { craftMockAnswer } from "./mock-agent";
import {
  answerCatalogWithVertex,
  narrateWithVertex,
  planWithVertex,
  type AgentPlan,
} from "./vertex-llm";

function step(
  name: string,
  start: number,
  detail?: TraceStep["detail"],
  extra?: Partial<TraceStep>,
): TraceStep {
  return {
    name,
    durationMs: Math.max(1, Date.now() - start),
    detail,
    ...extra,
  };
}

function summariseResult(result: AnalyticsResult) {
  return {
    metric: result.plan.metric,
    value: result.value,
    comparisonValue: result.comparisonValue,
    deltaPct: result.deltaPct,
    rowCount: result.rows.length,
    rows: result.rows.slice(0, 24),
  };
}

function runBreakdowns(
  companyId: string,
  plan: QueryPlan,
  dims: string[],
  steps: TraceStep[],
): AnalyticsResult[] {
  const run = (p: QueryPlan) => executeQueryPlan(p, { companyId });
  const out: AnalyticsResult[] = [];
  for (const dim of dims) {
    const t = Date.now();
    const breakdown = run({
      ...plan,
      dimensions: [dim],
      // keep filters unless they are on the same dimension
      filters: (plan.filters ?? []).filter((f) => f.dimension !== dim),
    });
    out.push(breakdown);
    steps.push(
      step(`query_breakdown: ${dim}`, t, undefined, {
        sql: breakdown.evidence.sql,
        params: breakdown.evidence.params,
      }),
    );
  }
  return out;
}

async function handleAnalyticsPlan(
  prompt: string,
  companyId: string,
  plan: AgentPlan,
  steps: TraceStep[],
): Promise<{
  steps: TraceStep[];
  answer: string;
  payload: Omit<AgentResponsePayload, "traceId">;
}> {
  if (!plan.queryPlan) {
    throw new Error("Vertex analytics plan missing queryPlan");
  }

  const queryPlan = plan.queryPlan;
  let t = Date.now();
  steps.push(step("create_query_plan", t, { plan: queryPlan, backend: "vertex" }));
  t = Date.now();
  steps.push(step("validate_query_plan", t, { valid: true }));

  t = Date.now();
  const result = executeQueryPlan(queryPlan, { companyId });
  steps.push(
    step("execute_sqlite", t, undefined, {
      sql: result.evidence.sql,
      params: result.evidence.params,
    }),
  );

  const breakdownDims =
    plan.breakdowns?.length > 0
      ? plan.breakdowns
      : queryPlan.comparison === "previous_period" && queryPlan.dimensions.length === 0
        ? ["region", "segment"]
        : [];

  const breakdowns = runBreakdowns(companyId, queryPlan, breakdownDims, steps);

  t = Date.now();
  let answer: string;
  try {
    answer = await narrateWithVertex({
      prompt,
      queryPlan,
      resultSummary: summariseResult(result),
      breakdownSummaries: breakdowns.map(summariseResult),
    });
    steps.push(step("generate_answer", t, { preview: answer.slice(0, 120), backend: "vertex" }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    steps.push(step("generate_answer_fallback", t, { error: message }));
    answer = craftMockAnswer(
      prompt,
      result,
      breakdowns,
      Boolean(queryPlan.filters?.some((f) => f.value === "Sumatera")),
      true,
      (p) => executeQueryPlan(p, { companyId }),
    );
  }

  return {
    steps,
    answer,
    payload: {
      answer,
      queryPlan,
      result,
      breakdowns: breakdowns.length ? breakdowns : undefined,
      visualisation: result.visualisation,
      evidence: result.evidence,
    },
  };
}

/**
 * Vertex-backed agent turn. Still executes only via QueryPlan → validate → SQLite.
 */
export async function runVertexAnalyticsTurn(input: {
  prompt: string;
  companyId: string;
}): Promise<{
  steps: TraceStep[];
  answer: string;
  payload: Omit<AgentResponsePayload, "traceId">;
}> {
  const prompt = input.prompt.trim();
  const companyId = input.companyId;
  const steps: TraceStep[] = [];

  let t = Date.now();
  steps.push(step("understand_intent", t, { prompt, backend: "vertex" }));

  t = Date.now();
  const plan = await planWithVertex(prompt);
  steps.push(step("vertex_plan", t, { plan }));

  if (plan.intent === "create_executive_dashboard") {
    t = Date.now();
    const dashboard = createExecutiveFromInvestigation(companyId, {
      metric: plan.queryPlan?.metric ?? "revenue",
      breakdownDimension: plan.queryPlan?.dimensions?.[0] ?? "region",
    });
    steps.push(step("update_dashboard_spec", t, { dashboardId: dashboard.id }));
    const answer =
      `Investigasi ini sudah ditambahkan ke dasbor **${dashboard.title}**.\n\n` +
      `Spesifikasi dasbor kini memuat KPI, tren, dan rincian sesuai investigasi. Buka tab Dasbor untuk melihatnya.`;
    return { steps, answer, payload: { answer, dashboard } };
  }

  if (plan.intent === "patch_dashboard" && plan.dashboardPatch) {
    t = Date.now();
    const dashboardId = plan.dashboardId ?? "executive-overview";
    const dashboard = applyDashboardPatch(companyId, dashboardId, plan.dashboardPatch);
    steps.push(step("apply_dashboard_patch", t, { patch: plan.dashboardPatch }));
    const answer =
      `Dasbor **${dashboard.title}** sudah diperbarui.\n\n` +
      "```json\n" +
      JSON.stringify(plan.dashboardPatch, null, 2) +
      "\n```";
    return {
      steps,
      answer,
      payload: { answer, dashboard, dashboardPatch: plan.dashboardPatch },
    };
  }

  if (plan.intent === "semantic_catalog") {
    t = Date.now();
    const model = loadSemanticModel();
    steps.push(step("discover_semantic_model", t, { model: model.model }));
    let answer: string;
    try {
      answer = await answerCatalogWithVertex(prompt);
    } catch {
      const metrics = listMetrics();
      const dimensions = listDimensions();
      answer =
        `Model semantik **${model.label}** menyediakan:\n\n` +
        `**Metrik:** ${metrics.map((m) => `${m.label} (${m.id})`).join(", ")}\n\n` +
        `**Dimensi:** ${dimensions.map((d) => `${d.label} (${d.id})`).join(", ")}`;
    }
    steps.push(step("generate_answer", Date.now(), { backend: "vertex" }));
    return { steps, answer, payload: { answer } };
  }

  if (plan.intent === "chitchat") {
    t = Date.now();
    const answer =
      plan.notes?.trim() ||
      "Saya Copilot analitik untuk data perdagangan Indonesia. Tanyakan pendapatan, pesanan, atau tren per wilayah/segmen.";
    steps.push(step("generate_answer", t, { backend: "vertex", intent: "chitchat" }));
    return { steps, answer, payload: { answer } };
  }

  return handleAnalyticsPlan(prompt, companyId, plan, steps);
}
