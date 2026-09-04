import { NextResponse } from "next/server";
import { listDimensions, listMetrics, loadSemanticModel } from "@/server/analytics/semantic-loader";
import { ensureDatabase } from "@/server/database/ensure";

export const runtime = "nodejs";

export async function GET() {
  ensureDatabase();
  const model = loadSemanticModel();
  return NextResponse.json({
    model,
    metrics: listMetrics(model),
    dimensions: listDimensions(model),
  });
}
