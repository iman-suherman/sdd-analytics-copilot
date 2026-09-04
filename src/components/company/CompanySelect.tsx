"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Company } from "@/components/company/CompanyProvider";
import { companyLogo } from "@/lib/company-logos";
import { cn } from "@/lib/utils";

type Props = {
  companies: Company[];
  companyId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
};

export function CompanySelect({ companies, companyId, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const selected = companies.find((c) => c.id === companyId) ?? companies[0] ?? null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const modal =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            <button
              type="button"
              aria-label="Tutup dialog"
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className="relative z-[201] m-auto flex max-h-[min(85vh,560px)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--paper)] shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
                <div>
                  <h2
                    id={titleId}
                    className="font-[family-name:var(--font-display)] text-lg text-[var(--ink)]"
                  >
                    Pilih perusahaan
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">
                    Tenant demo — nama & logo fiktif.
                  </p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-1 text-sm text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                >
                  Tutup
                </button>
              </div>

              <div className="grid gap-2 overflow-y-auto p-4 sm:grid-cols-2">
                {companies.map((c) => {
                  const active = c.id === companyId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        onChange(c.id);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition",
                        active
                          ? "border-[var(--logo-sky)] bg-[var(--accent-soft)]"
                          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--logo-sky)]/50",
                      )}
                    >
                      <Image
                        src={companyLogo(c)}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-lg"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-[var(--ink)]">{c.name}</span>
                        <span className="block text-[11px] text-[var(--muted)]">{c.sector}</span>
                      </span>
                      {active && (
                        <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--logo-sky)]">
                          Aktif
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        disabled={disabled || !selected}
        onClick={() => setOpen(true)}
        title={selected ? `${selected.name} — ganti perusahaan` : "Pilih perusahaan"}
        className={cn(
          "flex max-w-[260px] items-center gap-2.5 rounded-xl px-1 py-0.5 text-left transition",
          "hover:bg-[var(--surface-2)] focus:outline-none focus:ring-2 focus:ring-[var(--logo-sky)]/40",
          disabled && "opacity-60",
        )}
      >
        {selected && (
          <>
            <span className="min-w-0 flex-1 text-right">
              <span className="block truncate text-xs font-medium leading-tight text-[var(--ink)]">
                {selected.name}
              </span>
              <span className="block truncate text-[10px] leading-tight text-[var(--muted)]">
                {selected.sector}
              </span>
              <span className="mt-0.5 block truncate text-[10px] leading-tight text-[var(--muted)]">
                {selected.tagline}
              </span>
            </span>
            <Image
              src={companyLogo(selected)}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-lg"
            />
          </>
        )}
      </button>
      {modal}
    </>
  );
}
