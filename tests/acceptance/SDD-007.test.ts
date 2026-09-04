import fs from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { seedDatabase } from "../../data/seed";
import { runAnalyticsAgent } from "@/server/agent/analytics-agent";
import { DEFAULT_COMPANY_ID } from "@/server/company/service";
import { resetEnsureFlag } from "@/server/database/ensure";
import { getDashboard } from "@/server/dashboard/service";

describe("SDD-007 Dasbor", () => {
  beforeAll(() => {
    resetEnsureFlag();
    seedDatabase(path.join(process.cwd(), "data", "demo.sqlite"));
    resetEnsureFlag();
  });

  it("menyimpan investigasi ke dasbor eksekutif", async () => {
    const result = await runAnalyticsAgent({
      prompt: "Tambahkan investigasi ini ke dasbor eksekutif.",
      companyId: DEFAULT_COMPANY_ID,
    });

    expect(result.message.payload?.dashboard).toBeTruthy();
    const dashboard = getDashboard(DEFAULT_COMPANY_ID, "executive-overview");
    expect(dashboard).toBeTruthy();
    expect(dashboard!.title).toBe("Ikhtisar Eksekutif");
    expect(dashboard!.widgets.some((w) => w.type === "kpi")).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), "data", "demo.sqlite"))).toBe(true);
  });

  it("menerapkan patch ganti widget ke segmen", async () => {
    await runAnalyticsAgent({
      prompt: "Ganti wilayah dengan segmen pelanggan.",
      companyId: DEFAULT_COMPANY_ID,
    });
    const dashboard = getDashboard(DEFAULT_COMPANY_ID, "executive-overview");
    expect(dashboard!.widgets.some((w) => w.dimension === "segment")).toBe(true);
  });
});
