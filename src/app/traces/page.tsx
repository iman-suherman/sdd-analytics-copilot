import { Suspense } from "react";
import { TraceExplorer } from "@/components/trace/TraceExplorer";

export default function TracesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[var(--muted)]">Memuat jejak…</div>}>
      <TraceExplorer />
    </Suspense>
  );
}
