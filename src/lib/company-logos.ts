import type { Company } from "@/components/company/CompanyProvider";

/** Path logo fiktif per perusahaan (SVG di /public/companies). */
export const COMPANY_LOGOS: Record<string, string> = {
  tokoraya: "/companies/tokoraya.svg",
  gocepat: "/companies/gocepat.svg",
  bukadagang: "/companies/bukadagang.svg",
  belinusa: "/companies/belinusa.svg",
  jelajahid: "/companies/jelajahid.svg",
  angkutprima: "/companies/angkutprima.svg",
};

export function companyLogo(company: Pick<Company, "id" | "slug"> | null | undefined) {
  if (!company) return "/companies/tokoraya.svg";
  return COMPANY_LOGOS[company.id] ?? COMPANY_LOGOS[company.slug] ?? "/companies/tokoraya.svg";
}
