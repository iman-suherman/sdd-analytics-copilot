import { z } from "zod";
import { QueryPlanSchema, type QueryPlan } from "../analytics/query-plan";
import { listDimensions, listMetrics } from "../analytics/semantic-loader";
import { DashboardPatchSchema, type DashboardPatch } from "../dashboard/schema";
import { getVertexClient, getVertexModelId } from "./vertex-client";

export const AgentIntentSchema = z.enum([
  "analytics",
  "semantic_catalog",
  "create_executive_dashboard",
  "patch_dashboard",
  "chitchat",
]);

export const AgentPlanSchema = z.object({
  intent: AgentIntentSchema,
  queryPlan: QueryPlanSchema.optional(),
  /** Extra breakdown dimensions to run for diagnostic questions. */
  breakdowns: z.array(z.string()).default([]),
  dashboardId: z.string().optional(),
  dashboardPatch: DashboardPatchSchema.optional(),
  notes: z.string().optional(),
});

export type AgentPlan = z.infer<typeof AgentPlanSchema>;

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Vertex response was not valid JSON");
  }
}

function semanticCatalogPrompt(): string {
  const metrics = listMetrics()
    .map((m) => `- ${m.id}: ${m.label} — ${m.description ?? ""}`)
    .join("\n");
  const dimensions = listDimensions()
    .map((d) => `- ${d.id}: ${d.label}`)
    .join("\n");
  return `Metrik yang diizinkan:\n${metrics}\n\nDimensi yang diizinkan:\n${dimensions}`;
}

const PLAN_SYSTEM = `Anda adalah perencana QueryPlan untuk Copilot analitik e-commerce Indonesia.
Bahasa pengguna: Bahasa Indonesia. Pasar: Indonesia. Mata uang: IDR.

ATURAN KERAS:
- JANGAN menulis SQL.
- Hanya keluarkan JSON sesuai skema.
- queryPlan.metric dan dimensions/filters harus dari model semantik yang diberikan.
- Demo clock: "hari ini" = 2026-09-05, jadi "bulan lalu" = Agustus 2026.
- Untuk pertanyaan diagnostik (kenapa turun / bandingkan), set comparison: "previous_period" dan isi breakdowns dengan dimensi diagnostik (mis. region, segment).
- intent:
  - analytics: pertanyaan data
  - semantic_catalog: tanya daftar metrik/dimensi
  - create_executive_dashboard: simpan investigasi ke dasbor eksekutif
  - patch_dashboard: ubah widget dasbor (isi dashboardPatch)
  - chitchat: sapaan / di luar cakupan data

Skema queryPlan:
{
  "metric": string,
  "dimensions": string[],
  "filters": [{ "dimension": string, "op": "eq"|"neq"|"in", "value": string|string[] }],
  "time": { "dimension": "order_date", "range": "last_month"|"last_6_months"|..., "granularity"?: "month"|"week"|"day" },
  "comparison"?: "previous_period"|"none",
  "limit"?: number
}`;

export async function planWithVertex(prompt: string): Promise<AgentPlan> {
  const ai = getVertexClient();
  if (!ai) throw new Error("Vertex client unavailable");

  const response = await ai.models.generateContent({
    model: getVertexModelId(),
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              `${PLAN_SYSTEM}\n\n${semanticCatalogPrompt()}\n\n` +
              `Pertanyaan pengguna:\n${prompt}\n\n` +
              `Balas HANYA JSON objek dengan kunci: intent, queryPlan?, breakdowns?, dashboardId?, dashboardPatch?, notes?`,
          },
        ],
      },
    ],
    config: {
      temperature: 0.1,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Vertex returned empty plan");
  return AgentPlanSchema.parse(extractJsonObject(text));
}

export async function narrateWithVertex(input: {
  prompt: string;
  queryPlan?: QueryPlan;
  resultSummary: unknown;
  breakdownSummaries?: unknown[];
}): Promise<string> {
  const ai = getVertexClient();
  if (!ai) throw new Error("Vertex client unavailable");

  const response = await ai.models.generateContent({
    model: getVertexModelId(),
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              `Anda adalah analis bisnis yang menjawab dalam Bahasa Indonesia yang jelas dan ringkas.\n` +
              `Gunakan angka dari bukti; jangan mengarang SQL atau metrik di luar bukti.\n` +
              `Format markdown singkat (paragraf + bullet jika perlu). Jangan bungkus seluruh jawaban dalam code fence.\n\n` +
              `Pertanyaan:\n${input.prompt}\n\n` +
              `QueryPlan:\n${JSON.stringify(input.queryPlan ?? null, null, 2)}\n\n` +
              `Hasil utama:\n${JSON.stringify(input.resultSummary, null, 2)}\n\n` +
              `Breakdown:\n${JSON.stringify(input.breakdownSummaries ?? [], null, 2)}\n`,
          },
        ],
      },
    ],
    config: {
      temperature: 0.3,
      maxOutputTokens: 1024,
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Vertex returned empty answer");
  return text;
}

export async function answerCatalogWithVertex(prompt: string): Promise<string> {
  const ai = getVertexClient();
  if (!ai) throw new Error("Vertex client unavailable");

  const response = await ai.models.generateContent({
    model: getVertexModelId(),
    contents: [
      {
        role: "user",
        parts: [
          {
            text:
              `Jawab dalam Bahasa Indonesia tentang model semantik berikut.\n\n` +
              `${semanticCatalogPrompt()}\n\nPertanyaan: ${prompt}`,
          },
        ],
      },
    ],
    config: { temperature: 0.2, maxOutputTokens: 768 },
  });

  const text = response.text?.trim();
  if (!text) throw new Error("Vertex returned empty catalog answer");
  return text;
}

export type { DashboardPatch };
