import { NextResponse } from "next/server";
import { executeQueryPlan } from "@/server/analytics/execute";
import { QueryPlanSchema } from "@/server/analytics/query-plan";
import { companyIdFromRequest } from "@/server/company/service";
import { ensureDatabase } from "@/server/database/ensure";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    ensureDatabase();
    const companyId = companyIdFromRequest(request);
    const body = await request.json();
    const plan = QueryPlanSchema.parse(body);
    const result = executeQueryPlan(plan, { companyId });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
