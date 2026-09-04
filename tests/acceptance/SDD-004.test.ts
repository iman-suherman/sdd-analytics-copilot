import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { seedDatabase } from "../../data/seed";
import { runAnalyticsAgent } from "@/server/agent/analytics-agent";
import { executeQueryPlan } from "@/server/analytics/execute";
import { DEFAULT_COMPANY_ID } from "@/server/company/service";
import { resetEnsureFlag } from "@/server/database/ensure";
import { getDashboard } from "@/server/dashboard/service";
import { getTrace } from "@/server/traces/service";

const COMPANY = DEFAULT_COMPANY_ID;

describe("SDD-004 Analitik Percakapan", () => {
  beforeAll(() => {
    resetEnsureFlag();
    seedDatabase(path.join(process.cwd(), "data", "demo.sqlite"));
    resetEnsureFlag();
  });

  it("menanyakan pendapatan bulanan dengan QueryPlan terkendali + bukti + jejak", async () => {
    const result = await runAnalyticsAgent({
      prompt: "Berapa pendapatan bulan lalu?",
      companyId: COMPANY,
    });

    expect(result.message.payload?.queryPlan?.metric).toBe("revenue");
    expect(result.message.payload?.result?.value).toBeTypeOf("number");
    expect(result.message.payload?.result?.value).toBeGreaterThan(0);
    expect(result.message.content.length).toBeGreaterThan(10);
    expect(result.message.payload?.evidence?.metricDefinition).toBeTruthy();
    expect(result.message.payload?.evidence?.sql).toMatch(/company_id/i);

    const trace = getTrace(result.traceId);
    expect(trace).toBeTruthy();
    expect(trace!.companyId).toBe(COMPANY);
  });
});

describe("SDD-007 Dasbor", () => {
  beforeAll(() => {
    resetEnsureFlag();
    seedDatabase(path.join(process.cwd(), "data", "demo.sqlite"));
    resetEnsureFlag();
  });

  it("menyimpan investigasi ke dasbor eksekutif per tenant", async () => {
    const result = await runAnalyticsAgent({
      prompt: "Tambahkan investigasi ini ke dasbor eksekutif.",
      companyId: COMPANY,
    });

    expect(result.message.payload?.dashboard).toBeTruthy();
    const dashboard = getDashboard(COMPANY, "executive-overview");
    expect(dashboard).toBeTruthy();
    expect(dashboard!.title).toBe("Ikhtisar Eksekutif");
  });
});

describe("Multi-tenant", () => {
  beforeAll(() => {
    resetEnsureFlag();
    seedDatabase(path.join(process.cwd(), "data", "demo.sqlite"));
    resetEnsureFlag();
  });

  it("mengisolasi pendapatan antar perusahaan", () => {
    const a = executeQueryPlan(
      {
        metric: "revenue",
        dimensions: [],
        time: { dimension: "order_date", range: "last_month" },
      },
      { companyId: "tokoraya" },
    );
    const b = executeQueryPlan(
      {
        metric: "revenue",
        dimensions: [],
        time: { dimension: "order_date", range: "last_month" },
      },
      { companyId: "jelajahid" },
    );
    expect(a.value).toBeGreaterThan(0);
    expect(b.value).toBeGreaterThan(0);
    expect(a.value).not.toEqual(b.value);
  });
});
