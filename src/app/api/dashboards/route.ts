import { NextResponse } from "next/server";
import { executeQueryPlan } from "@/server/analytics/execute";
import { companyIdFromRequest } from "@/server/company/service";
import { ensureDatabase } from "@/server/database/ensure";
import {
  applyDashboardPatch,
  getDashboard,
  listDashboards,
  saveDashboard,
} from "@/server/dashboard/service";
import type { DashboardSpec, WidgetSpec } from "@/server/dashboard/schema";

export const runtime = "nodejs";

function widgetToPlan(widget: WidgetSpec) {
  return {
    metric: widget.metric,
    dimensions: widget.dimension && widget.type !== "line" ? [widget.dimension] : [],
    time: {
      dimension: "order_date",
      range: widget.type === "line" ? ("last_12_months" as const) : ("last_month" as const),
      granularity: widget.granularity,
    },
    comparison: widget.comparison === "previous_period" ? ("previous_period" as const) : undefined,
  };
}

export async function GET(request: Request) {
  ensureDatabase();
  const companyId = companyIdFromRequest(request);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) {
    const dashboard = getDashboard(companyId, id);
    if (!dashboard) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const widgets = dashboard.widgets.map((w) => ({
      widget: w,
      result: executeQueryPlan(widgetToPlan(w), { companyId }),
    }));
    return NextResponse.json({ dashboard, widgets, companyId });
  }
  return NextResponse.json({ dashboards: listDashboards(companyId), companyId });
}

export async function PUT(request: Request) {
  ensureDatabase();
  const companyId = companyIdFromRequest(request);
  const body = await request.json();
  const dashboard = saveDashboard(companyId, body as DashboardSpec);
  return NextResponse.json({ dashboard });
}

export async function PATCH(request: Request) {
  ensureDatabase();
  const companyId = companyIdFromRequest(request);
  const body = await request.json();
  const id = body.id ?? "executive-overview";
  const dashboard = applyDashboardPatch(companyId, id, body.patch);
  return NextResponse.json({ dashboard });
}
