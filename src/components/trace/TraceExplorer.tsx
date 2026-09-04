"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCompany } from "@/components/company/CompanyProvider";
import type { AgentTrace } from "@/server/traces/service";
import { cn } from "@/lib/utils";

export function TraceExplorer() {
  const searchParams = useSearchParams();
  const { companyFetch, companyId } = useCompany();
  const [traces, setTraces] = useState<AgentTrace[]>([]);
  const [selected, setSelected] = useState<AgentTrace | null>(null);
  const [openStep, setOpenStep] = useState<number | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await companyFetch("/api/traces");
      const data = await res.json();
      setTraces(data.traces ?? []);
      const id = searchParams.get("id");
      if (id) {
        const detail = await companyFetch(`/api/traces?id=${id}`);
        const body = await detail.json();
        if (body.trace) setSelected(body.trace);
      } else if (data.traces?.[0]) {
        setSelected(data.traces[0]);
      } else {
        setSelected(null);
      }
    })();
  }, [searchParams, companyFetch, companyId]);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] sm:px-6">
      <aside className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
        <h2 className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
          Jejak runtime
        </h2>
        <ul className="space-y-1">
          {traces.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => {
                  setSelected(t);
                  setOpenStep(null);
                }}
                className={cn(
                  "w-full rounded-lg px-2 py-2 text-left text-sm transition",
                  selected?.id === t.id
                    ? "bg-[var(--ink)] text-[var(--paper)]"
                    : "hover:bg-[var(--surface-2)]",
                )}
              >
                <div className="font-mono text-xs">{t.id}</div>
                <div className="truncate opacity-80">{t.prompt}</div>
              </button>
            </li>
          ))}
          {traces.length === 0 && (
            <li className="px-2 py-4 text-sm text-[var(--muted)]">
              Belum ada jejak. Ajukan pertanyaan di Kopilot.
            </li>
          )}
        </ul>
      </aside>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        {!selected ? (
          <p className="text-[var(--muted)]">Pilih jejak</p>
        ) : (
          <>
            <h1 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
              Jejak Agen
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Prompt pengguna</p>
            <p className="mt-1 rounded-lg bg-[var(--paper)] px-3 py-2 text-sm">&quot;{selected.prompt}&quot;</p>

            <ol className="mt-6 space-y-2">
              {selected.steps.map((s, i) => (
                <li key={`${s.name}-${i}`}>
                  <button
                    type="button"
                    onClick={() => setOpenStep(openStep === i ? null : i)}
                    className="flex w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-left text-sm hover:border-[var(--accent)]"
                  >
                    <span>
                      <span className="mr-2 font-mono text-xs text-[var(--muted)]">{i + 1}.</span>
                      {s.name}
                    </span>
                    <span className="font-mono text-xs text-[var(--muted)]">{s.durationMs} ms</span>
                  </button>
                  {openStep === i && (
                    <div className="mt-1 rounded-lg bg-[var(--ink)] p-3 text-xs text-[var(--paper)]">
                      {s.sql ? (
                        <pre className="overflow-auto whitespace-pre-wrap">{s.sql}</pre>
                      ) : (
                        <pre className="overflow-auto">
                          {JSON.stringify(s.detail ?? {}, null, 2)}
                        </pre>
                      )}
                      {s.params && (
                        <pre className="mt-2 opacity-80">param: {JSON.stringify(s.params)}</pre>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </div>
  );
}
