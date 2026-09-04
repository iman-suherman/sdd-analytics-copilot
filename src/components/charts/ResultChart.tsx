"use client";

import { useCallback, useRef } from "react";
import ReactECharts from "echarts-for-react";
import type { AnalyticsResult } from "@/server/analytics/execute";
import {
  LOGO,
  areaGradient,
  barGradient,
  baseChartOption,
  lineGradient,
} from "@/lib/chart-theme";
import { formatCurrency } from "@/lib/utils";

export type DrillPayload = {
  dimension?: string;
  value: string;
  kind: "category" | "kpi" | "point";
};

type ResultChartProps = {
  result: AnalyticsResult;
  drillable?: boolean;
  onDrill?: (payload: DrillPayload) => void;
};

export function ResultChart({ result, drillable = false, onDrill }: ResultChartProps) {
  const { visualisation, rows, plan, value, comparisonValue, deltaPct } = result;
  const chartRef = useRef<ReactECharts>(null);

  const handleChartClick = useCallback(
    (params: { name?: string; value?: unknown }) => {
      if (!drillable || !onDrill || params.name == null) return;
      onDrill({
        dimension: visualisation.dimension ?? plan.dimensions[0],
        value: String(params.name),
        kind: visualisation.type === "line" ? "point" : "category",
      });
    },
    [drillable, onDrill, visualisation.dimension, visualisation.type, plan.dimensions],
  );

  if (visualisation.type === "kpi") {
    const down = (deltaPct ?? 0) < 0;
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi
          label={plan.metric}
          value={formatCurrency(value)}
          drillable={drillable}
          onClick={
            drillable && onDrill
              ? () => onDrill({ value: plan.metric, kind: "kpi" })
              : undefined
          }
        />
        {comparisonValue != null && (
          <Kpi label="Periode sebelumnya" value={formatCurrency(comparisonValue)} />
        )}
        {deltaPct != null && (
          <Kpi
            label="Perubahan"
            value={`${deltaPct > 0 ? "+" : ""}${deltaPct.toFixed(1).replace(".", ",")}%`}
            tone={down ? "down" : "up"}
          />
        )}
      </div>
    );
  }

  if (visualisation.type === "bar" && visualisation.dimension) {
    const dim = visualisation.dimension;
    const data = rows.map((r) => ({
      name: String(r[dim]),
      value: Number(r[plan.metric] ?? r.average_order_value ?? 0),
    }));
    const base = baseChartOption();
    return (
      <div
        className={`chart-panel px-2 pb-2 pt-3 ${drillable ? "cursor-pointer" : ""}`}
        title={drillable ? "Klik batang untuk drill-down" : undefined}
      >
        <ReactECharts
          ref={chartRef}
          style={{ height: 280 }}
          onEvents={drillable ? { click: handleChartClick } : undefined}
          option={{
            ...base,
            xAxis: {
              type: "category",
              data: data.map((d) => d.name),
              axisLabel: { color: LOGO.muted },
              axisLine: { lineStyle: { color: LOGO.split } },
              axisTick: { show: false },
            },
            yAxis: {
              type: "value",
              axisLabel: { color: LOGO.muted },
              splitLine: { lineStyle: { color: LOGO.split, type: "dashed" } },
              axisLine: { show: false },
            },
            series: [
              {
                type: "bar",
                data: data.map((d) => d.value),
                barMaxWidth: 36,
                barGap: "40%",
                cursor: drillable ? "pointer" : "default",
                itemStyle: {
                  color: barGradient(),
                  borderRadius: [999, 999, 999, 999],
                  shadowBlur: 18,
                  shadowColor: LOGO.glow,
                },
                emphasis: {
                  itemStyle: {
                    shadowBlur: 28,
                    shadowColor: "rgba(45, 212, 191, 0.55)",
                  },
                },
              },
            ],
          }}
        />
      </div>
    );
  }

  if (visualisation.type === "line") {
    const dim = visualisation.dimension ?? "order_date";
    const grouped = new Map<string, number>();
    for (const row of rows) {
      const key = String(row[dim]);
      grouped.set(key, (grouped.get(key) ?? 0) + Number(row[plan.metric] ?? 0));
    }
    const keys = [...grouped.keys()].sort();
    const base = baseChartOption();
    return (
      <div
        className={`chart-panel px-2 pb-2 pt-3 ${drillable ? "cursor-pointer" : ""}`}
        title={drillable ? "Klik titik untuk drill-down" : undefined}
      >
        <ReactECharts
          style={{ height: 280 }}
          onEvents={drillable ? { click: handleChartClick } : undefined}
          option={{
            ...base,
            xAxis: {
              type: "category",
              data: keys,
              boundaryGap: false,
              axisLabel: { color: LOGO.muted },
              axisLine: { lineStyle: { color: LOGO.split } },
              axisTick: { show: false },
            },
            yAxis: {
              type: "value",
              axisLabel: { color: LOGO.muted },
              splitLine: { lineStyle: { color: LOGO.split, type: "dashed" } },
              axisLine: { show: false },
            },
            series: [
              {
                type: "line",
                smooth: true,
                symbol: "circle",
                symbolSize: drillable ? 10 : 8,
                data: keys.map((k) => grouped.get(k)),
                cursor: drillable ? "pointer" : "default",
                lineStyle: {
                  width: 3,
                  color: lineGradient(),
                  shadowBlur: 12,
                  shadowColor: LOGO.glow,
                },
                itemStyle: {
                  color: LOGO.cyan,
                  borderColor: "#fff",
                  borderWidth: 2,
                  shadowBlur: 10,
                  shadowColor: LOGO.glow,
                },
                areaStyle: { color: areaGradient() },
              },
            ],
          }}
        />
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-lg border border-[var(--border)] bg-[var(--paper)] p-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
            {Object.keys(rows[0] ?? { value: 0 }).map((k) => (
              <th key={k} className="px-2 py-1 font-medium">
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--border)]/60">
              {Object.values(row).map((v, j) => (
                <td key={j} className="px-2 py-1">
                  {String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
  drillable,
  onClick,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
  drillable?: boolean;
  onClick?: () => void;
}) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={
        onClick
          ? "rounded-lg border border-[var(--border)] bg-[var(--paper)] px-4 py-3 text-left transition hover:border-[var(--logo-sky)] hover:shadow-[0_0_0_1px_rgba(14,165,233,0.25)]"
          : "rounded-lg border border-[var(--border)] bg-[var(--paper)] px-4 py-3"
      }
      title={drillable ? "Klik untuk drill-down" : undefined}
    >
      <div className="text-xs uppercase tracking-wider text-[var(--muted)]">{label}</div>
      <div
        className={
          tone === "down"
            ? "mt-1 font-[family-name:var(--font-display)] text-2xl text-[#9b2c2c]"
            : tone === "up"
              ? "mt-1 font-[family-name:var(--font-display)] text-2xl logo-gradient-text"
              : "mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]"
        }
      >
        {value}
      </div>
      {onClick && (
        <div className="mt-1 text-[10px] uppercase tracking-wider text-[var(--logo-sky)]">
          Drill-down →
        </div>
      )}
    </Comp>
  );
}
