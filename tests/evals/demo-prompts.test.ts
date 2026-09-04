import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { seedDatabase } from "../../data/seed";
import { runAnalyticsAgent } from "@/server/agent/analytics-agent";
import { DEFAULT_COMPANY_ID } from "@/server/company/service";
import { resetEnsureFlag } from "@/server/database/ensure";

const PROMPTS = [
  "Bagaimana pendapatan bulan lalu dibanding bulan sebelumnya?",
  "Kenapa Sumatera turun?",
  "Tampilkan pendapatan per wilayah selama enam bulan terakhir.",
];

describe("evals: prompt demo Indonesia", () => {
  beforeAll(() => {
    resetEnsureFlag();
    seedDatabase(path.join(process.cwd(), "data", "demo.sqlite"));
    resetEnsureFlag();
  });

  it.each(PROMPTS)("mengembalikan QueryPlan + bukti untuk: %s", async (prompt) => {
    const result = await runAnalyticsAgent({
      prompt,
      companyId: DEFAULT_COMPANY_ID,
    });
    const plan = result.message.payload?.queryPlan;
    expect(plan?.metric).toBeTruthy();
    // No raw LLM SQL — plan is structured QueryPlan only.
    expect(plan).not.toHaveProperty("sql");
    expect(result.message.payload?.evidence?.sql).toMatch(/SELECT/i);
    expect(result.message.payload?.evidence?.sql).toMatch(/company_id/i);
    expect(result.message.payload?.traceId).toMatch(/^run_/);
  });

  it("menjelaskan penurunan Sumatera dengan QueryPlan berfilter region", async () => {
    const result = await runAnalyticsAgent({
      prompt: "Kenapa Sumatera turun?",
      companyId: DEFAULT_COMPANY_ID,
    });
    expect(result.message.content).toMatch(/Sumatera/i);
    expect(result.message.payload?.queryPlan?.filters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ dimension: "region", value: "Sumatera" }),
      ]),
    );
    expect(result.message.payload?.evidence?.sql).toMatch(/company_id/i);
  });
});
