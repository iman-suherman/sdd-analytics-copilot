import { and, eq } from "drizzle-orm";
import { getDb } from "../database/client";
import { dashboards } from "../database/schema";
import {
  DashboardPatchSchema,
  DashboardSpecSchema,
  type DashboardPatch,
  type DashboardSpec,
} from "./schema";

function dashboardRowId(companyId: string, specId: string) {
  return `${companyId}__${specId}`;
}

export function listDashboards(companyId: string): DashboardSpec[] {
  const db = getDb();
  const rows = db
    .select()
    .from(dashboards)
    .where(eq(dashboards.companyId, companyId))
    .all();
  return rows.map((r) => DashboardSpecSchema.parse(JSON.parse(r.specJson)));
}

export function getDashboard(companyId: string, id: string): DashboardSpec | null {
  const db = getDb();
  const rowId = id.includes("__") ? id : dashboardRowId(companyId, id);
  const row = db
    .select()
    .from(dashboards)
    .where(and(eq(dashboards.id, rowId), eq(dashboards.companyId, companyId)))
    .get();
  if (!row) {
    // fallback: look by logical id stored inside spec
    const all = db
      .select()
      .from(dashboards)
      .where(eq(dashboards.companyId, companyId))
      .all();
    const match = all.find((r) => {
      const spec = DashboardSpecSchema.parse(JSON.parse(r.specJson));
      return spec.id === id || r.id === id;
    });
    if (!match) return null;
    return DashboardSpecSchema.parse(JSON.parse(match.specJson));
  }
  return DashboardSpecSchema.parse(JSON.parse(row.specJson));
}

export function saveDashboard(companyId: string, spec: DashboardSpec): DashboardSpec {
  const parsed = DashboardSpecSchema.parse(spec);
  const db = getDb();
  const now = new Date().toISOString();
  const rowId = dashboardRowId(companyId, parsed.id);
  const existing = db
    .select()
    .from(dashboards)
    .where(and(eq(dashboards.id, rowId), eq(dashboards.companyId, companyId)))
    .get();

  if (existing) {
    db.update(dashboards)
      .set({
        title: parsed.title,
        specJson: JSON.stringify(parsed),
        updatedAt: now,
      })
      .where(eq(dashboards.id, rowId))
      .run();
  } else {
    db.insert(dashboards)
      .values({
        id: rowId,
        companyId,
        title: parsed.title,
        specJson: JSON.stringify(parsed),
        createdAt: now,
        updatedAt: now,
      })
      .run();
  }
  return parsed;
}

export function applyDashboardPatch(
  companyId: string,
  id: string,
  rawPatch: unknown,
): DashboardSpec {
  const patch = DashboardPatchSchema.parse(rawPatch) as DashboardPatch;
  const current = getDashboard(companyId, id);
  if (!current) throw new Error(`Dashboard ${id} not found`);

  let next: DashboardSpec = { ...current, widgets: [...current.widgets] };

  switch (patch.operation) {
    case "set_title":
      next = { ...next, title: patch.title };
      break;
    case "add_widget":
      next.widgets.push(patch.widget);
      break;
    case "remove_widget":
      next.widgets = next.widgets.filter((w) => w.id !== patch.widgetId);
      break;
    case "replace_widget": {
      next.widgets = next.widgets.map((w) =>
        w.id === patch.widgetId
          ? {
              ...w,
              ...patch.widget,
              id: patch.widget.id ?? w.id,
            }
          : w,
      );
      break;
    }
  }

  return saveDashboard(companyId, next);
}

export function createExecutiveFromInvestigation(
  companyId: string,
  input: {
    metric?: string;
    breakdownDimension?: string;
  },
): DashboardSpec {
  const metric = input.metric ?? "revenue";
  const dimension = input.breakdownDimension ?? "region";
  const dimLabel =
    dimension === "region"
      ? "wilayah"
      : dimension === "segment"
        ? "segmen"
        : dimension;
  const spec: DashboardSpec = {
    id: "executive-overview",
    title: "Ikhtisar Eksekutif",
    widgets: [
      {
        id: "revenue",
        type: "kpi",
        metric,
        comparison: "previous_period",
        title: "Pendapatan",
      },
      {
        id: "revenue-trend",
        type: "line",
        metric,
        dimension: "order_date",
        granularity: "month",
        title: "Tren pendapatan",
      },
      {
        id: dimension,
        type: "bar",
        metric,
        dimension,
        title: `Pendapatan per ${dimLabel}`,
      },
    ],
  };
  return saveDashboard(companyId, spec);
}
