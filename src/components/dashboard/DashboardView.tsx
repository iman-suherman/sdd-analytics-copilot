"use client";

import { useCallback, useEffect, useState } from "react";
import { ResultChart, type DrillPayload } from "@/components/charts/ResultChart";
import { useCompany } from "@/components/company/CompanyProvider";
import type {
  AnalyticsResult,
  DashboardSpec,
  QueryPlan,
  WidgetSpec,
} from "@/lib/api-types";

type WidgetPayload = { widget: WidgetSpec; result: AnalyticsResult };

type DrillFrame = {
  title: string;
  crumb: string;
  plan: QueryPlan;
  result: AnalyticsResult;
};

const DRILL_ORDER = ["region", "segment", "product_category"] as const;

const DIM_LABEL: Record<string, string> = {
  region: "wilayah",
  segment: "segmen",
  product_category: "kategori",
  order_date: "periode",
};

function nextDimension(current?: string | null): string | null {
  if (!current) return "region";
  const idx = DRILL_ORDER.indexOf(current as (typeof DRILL_ORDER)[number]);
  if (idx < 0) return "region";
  if (idx >= DRILL_ORDER.length - 1) return null;
  return DRILL_ORDER[idx + 1]!;
}

function widgetToPlan(widget: WidgetSpec): QueryPlan {
  return {
    metric: widget.metric,
    dimensions: widget.dimension && widget.type !== "line" ? [widget.dimension] : [],
    filters: [],
    time: {
      dimension: "order_date",
      range: widget.type === "line" ? "last_12_months" : "last_month",
      granularity: widget.granularity,
    },
    comparison: widget.comparison === "previous_period" ? "previous_period" : undefined,
  };
}

export function DashboardView() {
  const { companyFetch, companyId, company } = useCompany();
  const [dashboard, setDashboard] = useState<DashboardSpec | null>(null);
  const [widgets, setWidgets] = useState<WidgetPayload[]>([]);
  const [specOpen, setSpecOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drillStack, setDrillStack] = useState<DrillFrame[]>([]);
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
  const [drilling, setDrilling] = useState(false);

  const runPlan = useCallback(
    async (plan: QueryPlan): Promise<AnalyticsResult> => {
      const res = await companyFetch("/api/analytics/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plan),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal mengeksekusi kueri");
      return data as AnalyticsResult;
    },
    [companyFetch],
  );

  const load = useCallback(async () => {
    try {
      const res = await companyFetch("/api/dashboards?id=executive-overview");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal memuat");
      setDashboard(data.dashboard);
      setWidgets(data.widgets);
      setDrillStack([]);
      setActiveWidgetId(null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal");
    }
  }, [companyFetch]);

  useEffect(() => {
    void load();
  }, [load, companyId]);

  const currentDrill = drillStack[drillStack.length - 1] ?? null;

  const handleDrill = useCallback(
    async (widget: WidgetSpec, baseResult: AnalyticsResult, payload: DrillPayload) => {
      setError(null);
      setDrilling(true);
      try {
        const parentPlan =
          activeWidgetId === widget.id && currentDrill
            ? currentDrill.plan
            : widgetToPlan(widget);

        let nextPlan: QueryPlan;
        let crumb: string;
        let title: string;

        if (payload.kind === "kpi") {
          const dim = nextDimension(null)!;
          nextPlan = {
            metric: parentPlan.metric,
            dimensions: [dim],
            filters: [...(parentPlan.filters ?? [])],
            time: { dimension: "order_date", range: "last_month" },
          };
          crumb = "Semua";
          title = `${widget.title ?? widget.id} · per ${DIM_LABEL[dim] ?? dim}`;
        } else if (payload.kind === "point") {
          const month = payload.value;
          const [y, m] = month.split("-").map(Number);
          const start = `${month}-01`;
          const endMonth = m === 12 ? 1 : m! + 1;
          const endYear = m === 12 ? y! + 1 : y!;
          const end = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;
          nextPlan = {
            metric: parentPlan.metric,
            dimensions: ["region"],
            filters: [...(parentPlan.filters ?? [])],
            time: { dimension: "order_date", start, end },
          };
          crumb = month;
          title = `${widget.title ?? widget.id} · ${month} per wilayah`;
        } else {
          const fromDim = payload.dimension ?? parentPlan.dimensions[0];
          const toDim = nextDimension(fromDim);
          if (!toDim) {
            setError("Sudah di level rincian terdalam.");
            return;
          }
          nextPlan = {
            metric: parentPlan.metric,
            dimensions: [toDim],
            filters: [
              ...(parentPlan.filters ?? []),
              ...(fromDim
                ? [{ dimension: fromDim, op: "eq" as const, value: payload.value }]
                : []),
            ],
            time: parentPlan.time ?? { dimension: "order_date", range: "last_month" },
          };
          crumb = payload.value;
          title = `${payload.value} · per ${DIM_LABEL[toDim] ?? toDim}`;
        }

        const result = await runPlan(nextPlan);
        setActiveWidgetId(widget.id);
        setDrillStack((stack) => {
          const base =
            activeWidgetId === widget.id
              ? stack
              : [
                  {
                    title: widget.title ?? widget.id,
                    crumb: "Ringkasan",
                    plan: widgetToPlan(widget),
                    result: baseResult,
                  },
                ];
          return [...base, { title, crumb, plan: nextPlan, result }];
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Drill gagal");
      } finally {
        setDrilling(false);
      }
    },
    [activeWidgetId, currentDrill, runPlan],
  );

  function jumpToCrumb(index: number) {
    if (index <= 0) {
      setDrillStack([]);
      setActiveWidgetId(null);
      return;
    }
    setDrillStack((stack) => stack.slice(0, index + 1));
  }

  const canDrillFurther = (result: AnalyticsResult) => {
    const dim = result.visualisation.dimension ?? result.plan.dimensions[0];
    if (result.visualisation.type === "kpi") return true;
    if (result.visualisation.type === "line") return true;
    if (result.visualisation.type === "bar") return nextDimension(dim) != null;
    return false;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            {dashboard?.title ?? "Dasbor"}
          </h1>
          <p className="text-sm text-[var(--muted)]">
            {company?.name ?? "Perusahaan"} — klik KPI atau batang/titik grafik untuk drill-down.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSpecOpen((v) => !v)}
            className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm"
          >
            {specOpen ? "Sembunyikan spek" : "Tampilkan spek"}
          </button>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg bg-[var(--ink)] px-3 py-1.5 text-sm text-[var(--paper)]"
          >
            Muat ulang
          </button>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-[#9b2c2c]">{error}</p>}
      {drilling && (
        <p className="mb-4 animate-pulse text-sm text-[var(--logo-sky)]">Memuat drill-down…</p>
      )}

      {specOpen && dashboard && (
        <pre className="mb-6 overflow-auto rounded-xl border border-[var(--border)] bg-[var(--paper)] p-4 text-xs">
          {JSON.stringify(dashboard, null, 2)}
        </pre>
      )}

      {currentDrill && activeWidgetId && (
        <div className="mb-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm">
            {drillStack.map((frame, i) => (
              <span key={`${frame.crumb}-${i}`} className="flex items-center gap-1">
                {i > 0 && <span className="text-[var(--muted)]">/</span>}
                <button
                  type="button"
                  onClick={() => jumpToCrumb(i)}
                  className={
                    i === drillStack.length - 1
                      ? "font-medium text-[var(--ink)]"
                      : "text-[var(--logo-sky)] hover:underline"
                  }
                >
                  {frame.crumb}
                </button>
              </span>
            ))}
          </nav>
          <h2 className="mb-3 text-sm font-medium text-[var(--ink)]">{currentDrill.title}</h2>
          <ResultChart
            result={currentDrill.result}
            drillable={canDrillFurther(currentDrill.result)}
            onDrill={(payload) => {
              const host = widgets.find((w) => w.widget.id === activeWidgetId);
              if (!host) return;
              void handleDrill(host.widget, host.result, payload);
            }}
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {widgets.map(({ widget, result }) => (
          <section
            key={widget.id}
            className={
              widget.type === "kpi"
                ? "md:col-span-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
                : "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
            }
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-[var(--ink)]">
                {widget.title ?? widget.id}
              </h2>
              <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                Dapat di-drill
              </span>
            </div>
            <ResultChart
              result={result}
              drillable
              onDrill={(payload) => void handleDrill(widget, result, payload)}
            />
          </section>
        ))}
      </div>
    </div>
  );
}
