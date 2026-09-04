"use client";

import { useEffect, useState } from "react";

type ModelPayload = {
  model: {
    model: string;
    label: string;
    description?: string;
    metrics: Record<string, unknown>;
    dimensions: Record<string, unknown>;
  };
  metrics: { id: string; label: string; description?: string; type: string }[];
  dimensions: { id: string; label: string; field: string; type?: string }[];
};

const TRACE_LINKS = [
  {
    id: "SDD-004",
    title: "Analitik Percakapan",
    requirement: "specs/requirements/SDD-004-analytics-copilot.md",
    agent: "specs/agents/analytics-agent.md",
    implementation: "src/server/agent/analytics-agent.ts",
    tests: "tests/acceptance/SDD-004.test.ts",
  },
  {
    id: "SDD-005",
    title: "Tata Kelola Kueri",
    requirement: "specs/requirements/SDD-005-query-governance.md",
    agent: "specs/domain/query-plan.md",
    implementation: "src/server/analytics/compiler.ts",
    tests: "tests/integration/query-plan.test.ts",
  },
  {
    id: "SDD-007",
    title: "Dasbor",
    requirement: "specs/requirements/SDD-007-dashboard.md",
    agent: "specs/domain/dashboard.md",
    implementation: "src/server/dashboard/service.ts",
    tests: "tests/acceptance/SDD-007.test.ts",
  },
];

export function SemanticModelView() {
  const [data, setData] = useState<ModelPayload | null>(null);

  useEffect(() => {
    void fetch("/api/semantic-model")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-6 sm:px-6">
      <section>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
          Model Semantik
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Kosakata terkendali yang boleh dipakai agen. SQL sembarang dari LLM tidak pernah diterima.
        </p>

        {data && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--muted)]">
                Metrik
              </h2>
              <ul className="mt-3 space-y-3">
                {data.metrics.map((m) => (
                  <li key={m.id}>
                    <div className="font-medium text-[var(--ink)]">
                      {m.label}{" "}
                      <span className="font-mono text-xs text-[var(--muted)]">({m.id})</span>
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {m.type}
                      {m.description ? ` — ${m.description}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--muted)]">
                Dimensi
              </h2>
              <ul className="mt-3 space-y-3">
                {data.dimensions.map((d) => (
                  <li key={d.id}>
                    <div className="font-medium text-[var(--ink)]">
                      {d.label}{" "}
                      <span className="font-mono text-xs text-[var(--muted)]">({d.id})</span>
                    </div>
                    <div className="font-mono text-xs text-[var(--muted)]">{d.field}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
          Jejak Spesifikasi
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Setiap kapabilitas utama terlihat dari persyaratan → kontrak → implementasi → uji.
        </p>
        <div className="mt-4 space-y-4">
          {TRACE_LINKS.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-[var(--border)] bg-[var(--paper)] p-4"
            >
              <h3 className="font-medium text-[var(--ink)]">
                {item.id} {item.title}
              </h3>
              <ol className="mt-3 space-y-1 font-mono text-xs text-[var(--muted)]">
                <li>Persyaratan → {item.requirement}</li>
                <li>Kontrak → {item.agent}</li>
                <li>Implementasi → {item.implementation}</li>
                <li>Uji → {item.tests}</li>
                <li>Runtime → halaman Jejak setelah Kopilot dijalankan</li>
              </ol>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
