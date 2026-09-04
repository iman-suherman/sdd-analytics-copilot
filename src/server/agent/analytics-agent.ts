import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { AnalyticsResult } from "../analytics/execute";
import type { QueryPlan } from "../analytics/query-plan";
import { getDb } from "../database/client";
import { conversations, messages } from "../database/schema";
import { resolveAgentBackend } from "../gcp/credentials";
import { saveTrace, type TraceStep } from "../traces/service";
import { runMockAnalyticsTurn } from "./mock-agent";
import { runVertexAnalyticsTurn } from "./vertex-agent";

export type AgentMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  payload?: AgentResponsePayload | null;
  createdAt: string;
};

export type AgentResponsePayload = {
  answer: string;
  queryPlan?: QueryPlan;
  result?: AnalyticsResult;
  breakdowns?: AnalyticsResult[];
  dashboard?: unknown;
  dashboardPatch?: unknown;
  visualisation?: AnalyticsResult["visualisation"];
  evidence?: AnalyticsResult["evidence"];
  traceId: string;
};

function nowIso() {
  return new Date().toISOString();
}

function ensureConversation(
  companyId: string,
  conversationId?: string,
  title = "Obrolan analitik",
) {
  const db = getDb();
  if (conversationId) {
    const existing = db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .get();
    if (existing) return existing.id;
  }
  const id = conversationId ?? randomUUID();
  const ts = nowIso();
  db.insert(conversations)
    .values({ id, companyId, title, createdAt: ts, updatedAt: ts })
    .run();
  return id;
}

function persistMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  payload?: AgentResponsePayload,
) {
  const db = getDb();
  const id = randomUUID();
  const createdAt = nowIso();
  db.insert(messages)
    .values({
      id,
      conversationId,
      role,
      content,
      payloadJson: payload ? JSON.stringify(payload) : null,
      createdAt,
    })
    .run();
  db.update(conversations)
    .set({ updatedAt: createdAt })
    .where(eq(conversations.id, conversationId))
    .run();
  return { id, createdAt };
}

export function getConversationMessages(conversationId: string): AgentMessage[] {
  const db = getDb();
  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .all()
    .map((m) => ({
      id: m.id,
      role: m.role as AgentMessage["role"],
      content: m.content,
      payload: m.payloadJson ? (JSON.parse(m.payloadJson) as AgentResponsePayload) : null,
      createdAt: m.createdAt,
    }));
}

function newTraceId() {
  return `run_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

/**
 * Copilot analytics agent.
 * Uses Vertex AI (Gemini) when ADC + GCP_PROJECT_ID are available;
 * falls back to the deterministic mock (and always uses mock when AGENT_BACKEND=mock).
 */
export async function runAnalyticsAgent(input: {
  prompt: string;
  conversationId?: string;
  companyId: string;
}): Promise<{ conversationId: string; message: AgentMessage; traceId: string }> {
  const prompt = input.prompt.trim();
  const companyId = input.companyId;
  const conversationId = ensureConversation(
    companyId,
    input.conversationId,
    prompt.slice(0, 60),
  );
  persistMessage(conversationId, "user", prompt);

  const backend = resolveAgentBackend();
  let steps: TraceStep[];
  let answer: string;
  let payloadBody: Omit<AgentResponsePayload, "traceId">;

  if (backend === "vertex") {
    try {
      const turn = await runVertexAnalyticsTurn({ prompt, companyId });
      steps = turn.steps;
      answer = turn.answer;
      payloadBody = turn.payload;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("vertex agent failed; falling back to mock:", message);
      const turn = runMockAnalyticsTurn({ prompt, companyId });
      steps = [
        {
          name: "vertex_fallback",
          durationMs: 1,
          detail: { error: message },
        },
        ...turn.steps,
      ];
      answer = turn.answer;
      payloadBody = turn.payload as Omit<AgentResponsePayload, "traceId">;
    }
  } else {
    const turn = runMockAnalyticsTurn({ prompt, companyId });
    steps = turn.steps;
    answer = turn.answer;
    payloadBody = turn.payload as Omit<AgentResponsePayload, "traceId">;
  }

  const traceId = newTraceId();
  const payload: AgentResponsePayload = { ...payloadBody, answer, traceId };
  const saved = persistMessage(conversationId, "assistant", answer, payload);
  saveTrace({
    id: traceId,
    companyId,
    conversationId,
    messageId: saved.id,
    prompt,
    steps,
  });

  return {
    conversationId,
    traceId,
    message: {
      id: saved.id,
      role: "assistant",
      content: answer,
      payload,
      createdAt: saved.createdAt,
    },
  };
}
