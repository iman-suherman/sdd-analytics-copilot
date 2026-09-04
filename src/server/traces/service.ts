import { desc, eq } from "drizzle-orm";
import { getDb } from "../database/client";
import { agentTraces } from "../database/schema";

export type TraceStep = {
  name: string;
  durationMs: number;
  detail?: Record<string, unknown>;
  sql?: string;
  params?: unknown[];
};

export type AgentTrace = {
  id: string;
  companyId: string | null;
  conversationId: string | null;
  messageId: string | null;
  prompt: string;
  steps: TraceStep[];
  createdAt: string;
};

export function saveTrace(input: {
  id: string;
  companyId?: string | null;
  conversationId?: string | null;
  messageId?: string | null;
  prompt: string;
  steps: TraceStep[];
}): AgentTrace {
  const db = getDb();
  const createdAt = new Date().toISOString();
  db.insert(agentTraces)
    .values({
      id: input.id,
      companyId: input.companyId ?? null,
      conversationId: input.conversationId ?? null,
      messageId: input.messageId ?? null,
      prompt: input.prompt,
      stepsJson: JSON.stringify(input.steps),
      createdAt,
    })
    .run();

  return {
    id: input.id,
    companyId: input.companyId ?? null,
    conversationId: input.conversationId ?? null,
    messageId: input.messageId ?? null,
    prompt: input.prompt,
    steps: input.steps,
    createdAt,
  };
}

export function listTraces(companyId?: string, limit = 50): AgentTrace[] {
  const db = getDb();
  const rows = companyId
    ? db
        .select()
        .from(agentTraces)
        .where(eq(agentTraces.companyId, companyId))
        .orderBy(desc(agentTraces.createdAt))
        .limit(limit)
        .all()
    : db
        .select()
        .from(agentTraces)
        .orderBy(desc(agentTraces.createdAt))
        .limit(limit)
        .all();

  return rows.map((row) => ({
    id: row.id,
    companyId: row.companyId,
    conversationId: row.conversationId,
    messageId: row.messageId,
    prompt: row.prompt,
    steps: JSON.parse(row.stepsJson) as TraceStep[],
    createdAt: row.createdAt,
  }));
}

export function getTrace(id: string): AgentTrace | null {
  const db = getDb();
  const row = db.select().from(agentTraces).where(eq(agentTraces.id, id)).get();
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.companyId,
    conversationId: row.conversationId,
    messageId: row.messageId,
    prompt: row.prompt,
    steps: JSON.parse(row.stepsJson) as TraceStep[],
    createdAt: row.createdAt,
  };
}
