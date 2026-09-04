import { NextResponse } from "next/server";
import {
  getConversationMessages,
  runAnalyticsAgent,
} from "@/server/agent/analytics-agent";
import { companyIdFromRequest } from "@/server/company/service";
import { ensureDatabase } from "@/server/database/ensure";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    ensureDatabase();
    const companyId = companyIdFromRequest(request);
    const body = await request.json();
    const prompt = String(body.prompt ?? "");
    if (!prompt.trim()) {
      return NextResponse.json({ error: "prompt is required" }, { status: 400 });
    }
    const result = await runAnalyticsAgent({
      prompt,
      conversationId: body.conversationId,
      companyId,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    ensureDatabase();
    companyIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId required" }, { status: 400 });
    }
    const messages = getConversationMessages(conversationId);
    return NextResponse.json({ conversationId, messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
