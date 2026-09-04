import { eq } from "drizzle-orm";
import { getDb, getSqlite } from "../database/client";
import { companies } from "../database/schema";

export type Company = {
  id: string;
  name: string;
  slug: string;
  sector: string;
  tagline: string;
};

export const DEFAULT_COMPANY_ID = "tokoraya";

export function listCompanies(): Company[] {
  const db = getDb();
  return db
    .select()
    .from(companies)
    .all()
    .map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      sector: r.sector,
      tagline: r.tagline,
    }));
}

export function getCompany(id: string): Company | null {
  const db = getDb();
  const row = db.select().from(companies).where(eq(companies.id, id)).get();
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sector: row.sector,
    tagline: row.tagline,
  };
}

export function requireCompanyId(raw: string | null | undefined): string {
  const id = (raw ?? DEFAULT_COMPANY_ID).trim();
  if (!id) return DEFAULT_COMPANY_ID;
  const sqlite = getSqlite();
  const row = sqlite.prepare(`SELECT id FROM companies WHERE id = ?`).get(id) as
    | { id: string }
    | undefined;
  if (!row) {
    throw new Error(`Perusahaan tidak ditemukan: ${id}`);
  }
  return row.id;
}

export function companyIdFromRequest(request: Request): string {
  const header = request.headers.get("x-company-id");
  const { searchParams } = new URL(request.url);
  return requireCompanyId(header ?? searchParams.get("companyId"));
}
