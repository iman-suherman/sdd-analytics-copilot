"use client";

import Image from "next/image";
import { Suspense, useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Maximize2, MessageCircle, Minimize2, X } from "lucide-react";
import { CopilotChat } from "@/components/copilot/CopilotChat";
import { useCopilot } from "@/components/copilot/CopilotProvider";
import { cn } from "@/lib/utils";

/** Matches sticky AppNav height used elsewhere (`calc(100vh - 3.5rem)`). */
const APP_HEADER_PX = 56;

const DEFAULT_SIZE = { width: 720, height: 720 };
const MIN_SIZE = { width: 380, height: 420 };

function clampSize(width: number, height: number) {
  const maxW = Math.max(MIN_SIZE.width, window.innerWidth - 24);
  const maxH = Math.max(MIN_SIZE.height, window.innerHeight - APP_HEADER_PX - 24);
  return {
    width: Math.min(maxW, Math.max(MIN_SIZE.width, Math.round(width))),
    height: Math.min(maxH, Math.max(MIN_SIZE.height, Math.round(height))),
  };
}

function CopilotDockInner() {
  const { open, setOpen, ask } = useCopilot();
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [size, setSize] = useState(DEFAULT_SIZE);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (!open) setExpanded(false);
  }, [open]);

  // Deep-link /copilot?q=… → open dock + queue prompt.
  useEffect(() => {
    if (pathname !== "/copilot") return;
    const q = searchParams.get("q");
    ask(q ?? undefined);
    router.replace("/");
  }, [pathname, searchParams, ask, router]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (expanded) setExpanded(false);
        else setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, expanded, setOpen]);

  const onResizePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (expanded) return;
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startW: size.width,
        startH: size.height,
      };
    },
    [expanded, size.width, size.height],
  );

  const onResizePointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    // Bottom-right anchored: drag top-left handle → grow left/up.
    const nextW = drag.startW + (drag.startX - e.clientX);
    const nextH = drag.startH + (drag.startY - e.clientY);
    setSize(clampSize(nextW, nextH));
  }, []);

  const onResizePointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  function closeAll() {
    setExpanded(false);
    setOpen(false);
  }

  return (
    <>
      {/* Floating bubble — hide while expanded (quit is in panel header). */}
      {!expanded && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end p-4 sm:p-5">
          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className={cn(
                "group relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--logo-sky)]",
                open
                  ? "bg-[var(--surface-2)] text-[var(--ink)] ring-1 ring-[var(--border)]"
                  : "bg-[var(--ink)] text-[var(--paper)]",
              )}
              aria-label={open ? "Tutup kopilot" : "Buka kopilot"}
              aria-expanded={open}
            >
              {open ? (
                <X className="h-6 w-6" />
              ) : (
                <>
                  <MessageCircle className="h-6 w-6" />
                  <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-[var(--logo-sky)] ring-2 ring-[var(--paper)]" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden border border-[var(--border)] bg-[var(--surface)] transition-[opacity,transform] duration-200 ease-out",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
          expanded
            ? "inset-x-0 bottom-0 top-14 rounded-none shadow-none"
            : "bottom-20 right-4 rounded-2xl shadow-[0_18px_50px_rgba(15,23,42,0.18)] sm:bottom-24 sm:right-5",
          !open && "translate-y-3 scale-95",
        )}
        style={
          open && !expanded
            ? {
                width: size.width,
                height: size.height,
                maxWidth: "calc(100vw - 1.5rem)",
                maxHeight: `calc(100vh - ${APP_HEADER_PX + 88}px)`,
              }
            : open && expanded
              ? { width: "100%", height: `calc(100vh - ${APP_HEADER_PX}px)` }
              : { width: 0, height: 0 }
        }
        aria-hidden={!open}
        role="dialog"
        aria-label="Kopilot Analitik"
      >
        {mounted && (
          <>
            <header className="flex shrink-0 items-center gap-3 border-b border-[var(--border)] px-4 py-3">
              <Image
                src="/logo.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="font-[family-name:var(--font-display)] text-base text-[var(--ink)]">
                  Kopilot Analitik
                </div>
                <p className="truncate text-xs text-[var(--muted)]">
                  {expanded
                    ? "Mode layar penuh aplikasi · Esc untuk keluar"
                    : "Seret sudut untuk mengubah ukuran · perluas ke layar penuh"}
                </p>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                  aria-label={expanded ? "Keluar layar penuh" : "Layar penuh"}
                  title={expanded ? "Keluar layar penuh" : "Layar penuh"}
                >
                  {expanded ? (
                    <Minimize2 className="h-5 w-5" />
                  ) : (
                    <Maximize2 className="h-5 w-5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeAll}
                  className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
                  aria-label="Tutup kopilot"
                  title="Tutup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1">
              <CopilotChat variant="dock" />
            </div>

            {/* Resize handle (top-left of bottom-right window) */}
            {!expanded && open && (
              <div
                className="absolute left-0 top-0 z-10 flex h-5 w-5 cursor-nwse-resize items-start justify-start touch-none"
                onPointerDown={onResizePointerDown}
                onPointerMove={onResizePointerMove}
                onPointerUp={onResizePointerUp}
                onPointerCancel={onResizePointerUp}
                aria-label="Ubah ukuran jendela"
                title="Ubah ukuran"
              >
                <span className="m-1 h-2.5 w-2.5 rounded-sm border-l-2 border-t-2 border-[var(--muted)] opacity-70" />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export function CopilotDock() {
  return (
    <Suspense fallback={null}>
      <CopilotDockInner />
    </Suspense>
  );
}
