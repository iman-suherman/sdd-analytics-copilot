"use client";

import Link from "next/link";
import { useCompany } from "@/components/company/CompanyProvider";
import { useCopilot } from "@/components/copilot/CopilotProvider";
import { getHomeFlowCards } from "@/lib/company-prompts";

export function HomeHero() {
  const { company, ready } = useCompany();
  const { ask } = useCopilot();
  const flow = getHomeFlowCards(company);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
        Referensi Spec-Driven Development
      </p>
      <h1 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-4xl leading-tight text-[var(--ink)] sm:text-5xl">
        SDD Analitik Kopilot
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-[var(--muted)]">
        Ajukan pertanyaan bahasa alami tentang data{" "}
        <span className="font-medium text-[var(--ink)]">
          {ready ? company?.name ?? "tenant" : "…"}
        </span>
        {company ? ` (${company.sector})` : ""}. Periksa QueryPlan terkendali, bukti, grafik, lalu
        simpan ke dasbor — buka gelembung kopilot di kanan bawah.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => ask()}
          className="rounded-lg bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--paper)]"
        >
          Buka Kopilot
        </button>
        <Link
          href="/semantic-model"
          className="rounded-lg border border-[var(--border)] bg-[var(--paper)] px-5 py-2.5 text-sm"
        >
          Jejak spesifikasi
        </Link>
      </div>

      <ol className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {flow.map((step, i) => (
          <li key={step.title}>
            <button
              type="button"
              onClick={() => ask(step.prompt)}
              className="block h-full w-full rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-4 text-left transition hover:border-[var(--logo-sky)] hover:shadow-[0_0_0_1px_rgba(14,165,233,0.2)]"
            >
              <div className="text-xs font-mono text-[var(--muted)]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                {step.title}
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">{step.body}</p>
              <span className="mt-3 inline-block text-xs font-medium text-[var(--logo-sky)]">
                Jalankan di kopilot →
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
