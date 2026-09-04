"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CompanySelect } from "@/components/company/CompanySelect";
import { useCompany } from "@/components/company/CompanyProvider";
import { useCopilot } from "@/components/copilot/CopilotProvider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboards", label: "Dasbor" },
  { href: "/semantic-model", label: "Model Semantik" },
  { href: "/traces", label: "Jejak" },
];

export function AppNav() {
  const pathname = usePathname();
  const { companies, companyId, setCompanyId, ready } = useCompany();
  const { ask, open } = useCopilot();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-start gap-4 px-4 py-2.5 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center gap-3 self-center">
          <Image
            src="/logo.png"
            alt="SDD Analitik Kopilot"
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-cover"
            priority
          />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--ink)]">
              SDD Analitik
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Kopilot
            </span>
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 flex-wrap items-center gap-1 self-center">
          <button
            type="button"
            onClick={() => ask()}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              open
                ? "bg-[var(--ink)] text-[var(--paper)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
            )}
          >
            Kopilot
          </button>
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-[var(--ink)] text-[var(--paper)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto shrink-0 self-start">
          <CompanySelect
            companies={companies}
            companyId={companyId}
            onChange={setCompanyId}
            disabled={!ready || companies.length === 0}
          />
        </div>
      </div>
    </header>
  );
}
