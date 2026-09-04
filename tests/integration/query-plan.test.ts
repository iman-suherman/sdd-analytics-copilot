import fs from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { seedDatabase } from "../../data/seed";
import { compileQueryPlan } from "@/server/analytics/compiler";
import { executeQueryPlan } from "@/server/analytics/execute";
import { loadSemanticModel } from "@/server/analytics/semantic-loader";
import { validateQueryPlan, QueryPlanValidationError } from "@/server/analytics/validate";
import { DEFAULT_COMPANY_ID } from "@/server/company/service";
import { resetEnsureFlag } from "@/server/database/ensure";

describe("Tata kelola QueryPlan", () => {
  beforeAll(() => {
    resetEnsureFlag();
    seedDatabase(path.join(process.cwd(), "data", "demo.sqlite"));
    resetEnsureFlag();
  });

  it("memuat model semantik commerce Indonesia", () => {
    const model = loadSemanticModel(true);
    expect(model.model).toBe("commerce");
    expect(model.metrics.revenue.label).toBe("Pendapatan");
  });

  it("mengompilasi metrik + tenant filter (company_id)", () => {
    const plan = validateQueryPlan({
      metric: "revenue",
      dimensions: ["region"],
      filters: [],
      time: { dimension: "order_date", range: "last_month" },
    });
    const compiled = compileQueryPlan(plan, undefined, { companyId: DEFAULT_COMPANY_ID });
    expect(compiled.sql).toMatch(/o\.company_id = \?/i);
    expect(compiled.params[0]).toBe(DEFAULT_COMPANY_ID);
  });

  it("menolak metrik tidak dikenal", () => {
    expect(() =>
      validateQueryPlan({
        metric: "bukan_metrik",
        dimensions: [],
        filters: [],
      }),
    ).toThrow(QueryPlanValidationError);
  });

  it("mengeksekusi perbandingan pendapatan bulan lalu", () => {
    const result = executeQueryPlan(
      {
        metric: "revenue",
        dimensions: [],
        time: { dimension: "order_date", range: "last_month" },
        comparison: "previous_period",
      },
      { companyId: DEFAULT_COMPANY_ID },
    );
    expect(result.value).toBeGreaterThan(0);
    expect(result.comparisonValue).toBeGreaterThan(0);
    expect(result.deltaPct!).toBeLessThan(0);
    expect(result.evidence.sql).toMatch(/company_id/i);
  });

  it("menunjukkan Sumatera turun di Agustus untuk TokoRaya", () => {
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
    expect(fs.existsSync(path.join(process.cwd(), "semantic", "commerce.yaml"))).toBe(true);
  });
});
