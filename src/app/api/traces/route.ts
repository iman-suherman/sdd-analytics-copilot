import { NextResponse } from "next/server";
import { companyIdFromRequest } from "@/server/company/service";
import { ensureDatabase } from "@/server/database/ensure";
import { getTrace, listTraces } from "@/server/traces/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  ensureDatabase();
  const companyId = companyIdFromRequest(request);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (id) {
    const trace = getTrace(id);
    if (!trace) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ trace });
  }
  return NextResponse.json({ traces: listTraces(companyId) });
}
