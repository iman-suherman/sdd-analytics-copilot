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
    expect(result.message.payload?.queryPlan?.metric).toBeTruthy();
    expect(result.message.payload?.evidence?.sql).toMatch(/SELECT/i);
    expect(result.message.payload?.traceId).toMatch(/^run_/);
  });
});
