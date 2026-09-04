import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { seedDatabase } from "../../data/seed";
import { runAnalyticsAgent } from "@/server/agent/analytics-agent";
import { executeQueryPlan } from "@/server/analytics/execute";
import { DEFAULT_COMPANY_ID } from "@/server/company/service";
import { resetEnsureFlag } from "@/server/database/ensure";
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

    const plan = result.message.payload?.queryPlan;
    expect(plan?.metric).toBe("revenue");
    // Boundary: agent emits QueryPlan JSON only — never raw SQL.
    expect(plan).not.toHaveProperty("sql");
    expect(result.message.payload?.result?.value).toBeTypeOf("number");
    expect(result.message.payload?.result?.value).toBeGreaterThan(0);
    expect(result.message.content.length).toBeGreaterThan(10);
    expect(result.message.payload?.evidence?.metricDefinition).toBeTruthy();
    expect(result.message.payload?.evidence?.sql).toMatch(/company_id/i);
    expect(result.message.payload?.evidence?.sql).toMatch(/SELECT/i);

    const trace = getTrace(result.traceId);
    expect(trace).toBeTruthy();
    expect(trace!.companyId).toBe(COMPANY);
  });
});

describe("SDD-002 Pola Sumatera", () => {
  beforeAll(() => {
    resetEnsureFlag();
    seedDatabase(path.join(process.cwd(), "data", "demo.sqlite"));
    resetEnsureFlag();
  });

  it("Sumatera Agustus lebih rendah secara material vs Juli (tokoraya)", () => {
    const result = executeQueryPlan(
      {
        metric: "revenue",
        dimensions: ["region"],
        filters: [{ dimension: "region", op: "eq", value: "Sumatera" }],
        time: { dimension: "order_date", range: "last_month" },
        comparison: "previous_period",
      },
      { companyId: "tokoraya" },
    );
    expect(result.deltaPct!).toBeLessThan(-10);
    expect(result.evidence.sql).toMatch(/company_id/i);
  });
});

describe("SDD-009 Multi-tenant", () => {
  beforeAll(() => {
    resetEnsureFlag();
    seedDatabase(path.join(process.cwd(), "data", "demo.sqlite"));
    resetEnsureFlag();
  });

  it("mengisolasi pendapatan antar perusahaan dengan predikat company_id", () => {
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
    expect(a.evidence.sql).toMatch(/company_id/i);
    expect(b.evidence.sql).toMatch(/company_id/i);
  });
});
