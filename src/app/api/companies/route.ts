import { NextResponse } from "next/server";
import { companyIdFromRequest, listCompanies } from "@/server/company/service";
import { ensureDatabase } from "@/server/database/ensure";

export const runtime = "nodejs";

export async function GET(request: Request) {
  ensureDatabase();
  try {
    const companies = listCompanies();
    let selectedId: string | null = null;
    try {
      selectedId = companyIdFromRequest(request);
    } catch {
      selectedId = companies[0]?.id ?? null;
    }
    return NextResponse.json({
      companies,
      defaultCompanyId: selectedId,
      notice:
        "Semua nama perusahaan bersifat fiktif untuk demo; tidak berafiliasi dengan merek sungguhan.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
