import { executeQueryPlan, type AnalyticsResult } from "../analytics/execute";
import type { QueryPlan } from "../analytics/query-plan";
import { listDimensions, listMetrics, loadSemanticModel } from "../analytics/semantic-loader";
import {
  applyDashboardPatch,
  createExecutiveFromInvestigation,
} from "../dashboard/service";
import type { TraceStep } from "../traces/service";
import type { AgentResponsePayload } from "./analytics-agent";

const DECLINE_REGION = "Sumatera";

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

function formatCurrency(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatPct(n: number | null | undefined) {
  if (n == null || Number.isNaN(n)) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1).replace(".", ",")}%`;
}

export function craftMockAnswer(
  prompt: string,
  result: AnalyticsResult,
  breakdowns: AnalyticsResult[],
  whySumatera: boolean,
  whyFall: boolean,
  run: (plan: QueryPlan) => AnalyticsResult,
): string {
  const value = formatCurrency(result.value);
  const prev = formatCurrency(result.comparisonValue);
  const delta = formatPct(result.deltaPct);

  if (result.plan.time?.granularity === "month" && result.plan.dimensions.includes("region")) {
    const lines = result.rows
      .slice(0, 12)
      .map(
        (r) =>
          `- ${r.order_date} / ${r.region}: ${formatCurrency(Number(r[result.plan.metric]))}`,
      )
      .join("\n");
    return `Berikut **pendapatan** per wilayah selama enam bulan terakhir:\n\n${lines}`;
  }

  if (result.plan.time?.granularity) {
    return `Berikut tren **${result.plan.metric}** pada periode yang dipilih. Lihat grafik dan bukti di bawah.`;
  }

  if (result.plan.dimensions.length === 1 && !whyFall && !whySumatera) {
    const dim = result.plan.dimensions[0]!;
    const lines = result.rows
      .map((r) => {
        const v = Number(r[result.plan.metric] ?? r.average_order_value ?? 0);
        return `- **${r[dim]}**: ${formatCurrency(v)}`;
      })
      .join("\n");
    return `**${result.plan.metric}** berdasarkan ${dim}:\n\n${lines}`;
  }

  if (whySumatera) {
    const regionRows = breakdowns.find((b) => b.plan.dimensions.includes("region"))?.rows ?? [];
    const row = regionRows.find((r) => r.region === DECLINE_REGION);
    return (
      `Pendapatan **Sumatera** turun tajam bulan lalu dibanding periode sebelumnya.\n\n` +
      (row
        ? `Kontribusi Sumatera pada periode ini: ${formatCurrency(Number(row.revenue ?? row[result.plan.metric]))}.\n\n`
        : "") +
      `Penurunan terkonsentrasi pada volume pesanan Sumatera (pola demo: penurunan Agustus di Sumatera, misalnya gangguan logistik). ` +
      `Campuran segmen di Sumatera terlihat pada rincian bukti.`
    );
  }

  if (whyFall || (result.comparisonValue != null && result.plan.dimensions.length === 0)) {
    const regionBreakdown = breakdowns.find((b) => b.plan.dimensions.includes("region"));
    let driverLine = "";
    if (regionBreakdown) {
      const deltas = regionBreakdown.rows.map((row) => {
        const region = String(row.region);
        const prior = run({
          metric: result.plan.metric,
          dimensions: [],
          filters: [{ dimension: "region", op: "eq", value: region }],
          time: { dimension: "order_date", range: "last_month" },
          comparison: "previous_period",
        });
        return {
          region,
          deltaPct: prior.deltaPct ?? 0,
        };
      });
      deltas.sort((a, b) => a.deltaPct - b.deltaPct);
      const worst = deltas[0];
      if (worst) {
        driverLine = `Penurunan terbesar berasal dari **${worst.region}**, turun ${Math.abs(worst.deltaPct).toFixed(1).replace(".", ",")}%.`;
      }
    }

    return (
      `Pendapatan sebesar ${value}, ${
        (result.deltaPct ?? 0) < 0 ? "turun" : "naik"
      } ${Math.abs(result.deltaPct ?? 0).toFixed(1).replace(".", ",")}% dibanding bulan sebelumnya (${prev}).\n\n` +
      (driverLine ? `${driverLine}\n\n` : "") +
      `Tanyakan *Kenapa Sumatera turun?* untuk analisis lebih dalam, atau *Tambahkan investigasi ini ke dasbor eksekutif* untuk menyimpan tampilan.`
    );
  }

  if (result.comparisonValue != null) {
    return `**${result.plan.metric}** sebesar ${value} (${delta} vs periode sebelumnya ${prev}).`;
  }

  return `**${result.plan.metric}** pada periode terpilih adalah ${value}.\n\n(Pertanyaan: ${prompt.slice(0, 80)})`;
}

/**
 * Deterministic rule-based agent (tests / offline demo).
 */
export function runMockAnalyticsTurn(input: {
  prompt: string;
  companyId: string;
}): {
  steps: TraceStep[];
  answer: string;
  payload: Omit<AgentResponsePayload, "traceId"> & { traceId?: string };
} {
  const prompt = input.prompt.trim();
  const companyId = input.companyId;
  const run = (plan: QueryPlan) => executeQueryPlan(plan, { companyId });
  const steps: TraceStep[] = [];
  const lower = prompt.toLowerCase();

  let t = Date.now();
  steps.push(step("understand_intent", t, { prompt, backend: "mock" }));

  if (
    /tambah(kan)? (ini|investigasi|analisis).*(dasbor|dashboard)|buat dasbor eksekutif|simpan ke dasbor/i.test(
      prompt,
    )
  ) {
    t = Date.now();
    const dashboard = createExecutiveFromInvestigation(companyId, {
      metric: "revenue",
      breakdownDimension: "region",
    });
    steps.push(step("update_dashboard_spec", t, { dashboardId: dashboard.id }));
    const answer =
      `Investigasi ini sudah ditambahkan ke dasbor **${dashboard.title}**.\n\n` +
      `Spesifikasi dasbor kini memuat KPI pendapatan, tren bulanan, dan rincian per wilayah. Buka tab Dasbor untuk melihatnya.`;
    return {
      steps,
      answer,
      payload: { answer, dashboard },
    };
  }

  if (
    /ganti (wilayah|region) (dengan|jadi) (segmen|segmen pelanggan)|replace region with (customer )?segment/i.test(
      prompt,
    )
  ) {
    t = Date.now();
    const patch = {
      operation: "replace_widget" as const,
      widgetId: "region",
      widget: {
        id: "segment",
        type: "bar" as const,
        metric: "revenue",
        dimension: "segment",
        title: "Pendapatan per segmen",
      },
    };
    const dashboard = applyDashboardPatch(companyId, "executive-overview", patch);
    steps.push(step("apply_dashboard_patch", t, { patch }));
    const answer =
      `Widget wilayah diganti menjadi segmen pelanggan pada **${dashboard.title}**.\n\n` +
      "```json\n" +
      JSON.stringify(patch, null, 2) +
      "\n```";
    return {
      steps,
      answer,
      payload: { answer, dashboard, dashboardPatch: patch },
    };
  }

  if (/metrik apa|daftar metrik|model semantik|dimensi apa|apa saja metrik/i.test(lower)) {
    t = Date.now();
    const model = loadSemanticModel();
    steps.push(step("discover_semantic_model", t, { model: model.model }));
    const metrics = listMetrics();
    const dimensions = listDimensions();
    const answer =
      `Model semantik **${model.label}** menyediakan:\n\n` +
      `**Metrik:** ${metrics.map((m) => `${m.label} (${m.id})`).join(", ")}\n\n` +
      `**Dimensi:** ${dimensions.map((d) => `${d.label} (${d.id})`).join(", ")}`;
    return { steps, answer, payload: { answer } };
  }

  t = Date.now();
  let metric = "revenue";
  if (/nilai rata|aov|rata-rata pesanan/i.test(lower)) metric = "average_order_value";
  else if (/\b(pesanan|orders)\b/i.test(lower) && !/pendapatan|omzet|revenue/i.test(lower))
    metric = "orders";
  else if (/pelanggan|customers/i.test(lower) && !/pendapatan|omzet|revenue/i.test(lower))
    metric = "customers";
  steps.push(step(`resolve_metric: ${metric}`, t));

  const wantsComparison =
    /banding|dibanding|vs|versus|sebelumnya|turun|anjlok|kenapa|mengapa|decline|compar/i.test(
      lower,
    );
  const whySumatera =
    /kenapa sumatera|mengapa sumatera|sumatera turun|sumatera anjlok|why did sumatera/i.test(
      lower,
    );
  const wantsRegion =
    /per wilayah|berdasarkan wilayah|by region|wilayah|region/i.test(lower) && !whySumatera;
  const wantsSegment = /per segmen|berdasarkan segmen|segmen pelanggan|by segment/i.test(lower);
  const wantsTrend =
    /tren|enam bulan|6 bulan|enam bulan terakhir|last six months|bulanan/i.test(lower);
  const whyFall =
    /kenapa (pendapatan|omzet)|mengapa (pendapatan|omzet)|apa yang mendorong|penurunan terbesar|why did (revenue )?fall/i.test(
      lower,
    );

  const dimensions: string[] = [];
  if (wantsRegion) dimensions.push("region");
  if (wantsSegment) dimensions.push("segment");
  if (/per kategori|kategori produk|by categor/i.test(lower)) dimensions.push("product_category");

  const plan: QueryPlan = {
    metric,
    dimensions,
    filters: whySumatera
      ? [{ dimension: "region", op: "eq", value: DECLINE_REGION }]
      : [],
    time: {
      dimension: "order_date",
      range: wantsTrend ? "last_6_months" : "last_month",
      granularity: wantsTrend ? "month" : undefined,
    },
    comparison: wantsComparison && !wantsTrend ? "previous_period" : undefined,
  };

  t = Date.now();
  steps.push(step("create_query_plan", t, { plan }));
  t = Date.now();
  steps.push(step("validate_query_plan", t, { valid: true }));

  t = Date.now();
  const result = run(plan);
  steps.push(
    step("execute_sqlite", t, undefined, {
      sql: result.evidence.sql,
      params: result.evidence.params,
    }),
  );

  const breakdowns: AnalyticsResult[] = [];
  if (
    whyFall ||
    whySumatera ||
    (wantsComparison && dimensions.length === 0 && !wantsTrend)
  ) {
    t = Date.now();
    const byRegion = run({ ...plan, dimensions: ["region"], filters: [] });
    breakdowns.push(byRegion);
    steps.push(
      step("query_breakdown: region", t, undefined, {
        sql: byRegion.evidence.sql,
        params: byRegion.evidence.params,
      }),
    );

    t = Date.now();
    const bySegment = run({ ...plan, dimensions: ["segment"], filters: [] });
    breakdowns.push(bySegment);
    steps.push(
      step("query_breakdown: segment", t, undefined, {
        sql: bySegment.evidence.sql,
        params: bySegment.evidence.params,
      }),
    );
  }

  if (whySumatera) {
    t = Date.now();
    const bySeg = run({
      metric,
      dimensions: ["segment"],
      filters: [{ dimension: "region", op: "eq", value: DECLINE_REGION }],
      time: { dimension: "order_date", range: "last_month" },
      comparison: "previous_period",
    });
    breakdowns.push(bySeg);
    steps.push(step("query_breakdown: sumatera_segment", t));
  }

  t = Date.now();
  const answer = craftMockAnswer(prompt, result, breakdowns, whySumatera, whyFall, run);
  steps.push(step("generate_answer", t, { preview: answer.slice(0, 120), backend: "mock" }));

  return {
    steps,
    answer,
    payload: {
      answer,
      queryPlan: plan,
      result,
      breakdowns: breakdowns.length ? breakdowns : undefined,
      visualisation: result.visualisation,
      evidence: result.evidence,
    },
  };
}
