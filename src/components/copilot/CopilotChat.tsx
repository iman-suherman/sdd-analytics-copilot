"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import Markdown from "react-markdown";
import { ResultChart } from "@/components/charts/ResultChart";
import { useCompany } from "@/components/company/CompanyProvider";
import { useCopilot } from "@/components/copilot/CopilotProvider";
import type { AgentMessage, AgentResponsePayload } from "@/server/agent/analytics-agent";
import { getCompanyDemoCards } from "@/lib/company-prompts";
import { cn } from "@/lib/utils";

/** ~ChatGPT pace: a few chars per frame. */
const CHARS_PER_TICK = 2;
const TICK_MS = 18;

export function CopilotChat({ variant = "dock" }: { variant?: "dock" | "page" }) {
  const { companyFetch, companyId, company } = useCompany();
  const { pendingPrompt, clearPendingPrompt } = useCopilot();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const autoSentRef = useRef<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const sendRef = useRef<(prompt: string) => void>(() => {});
  const demoCards = getCompanyDemoCards(company);
  const busy = pending || streamingMessageId != null;

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    setConversationId(null);
    setMessages([]);
    setStreamingMessageId(null);
    autoSentRef.current = null;
  }, [companyId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending, streamingMessageId]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
  };

  function send(prompt: string) {
    if (!prompt.trim() || busy) return;
    setError(null);
    setInput("");
    const optimistic: AgentMessage = {
      id: `tmp_${Date.now()}`,
      role: "user",
      content: prompt,
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);

    startTransition(async () => {
      try {
        const res = await companyFetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            conversationId: conversationIdRef.current,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Permintaan gagal");
        setConversationId(data.conversationId);
        conversationIdRef.current = data.conversationId;
        const assistant = data.message as AgentMessage;
        setMessages((m) => {
          const withoutOptimistic = m.filter((x) => x.id !== optimistic.id);
          return [
            ...withoutOptimistic,
            { ...optimistic, id: `user_${assistant.id}` },
            assistant,
          ];
        });
        setStreamingMessageId(assistant.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal");
      }
    });
  }

  sendRef.current = send;

  // External ask() / deep-links
  useEffect(() => {
    if (!pendingPrompt || !company) return;
    if (autoSentRef.current === pendingPrompt) {
      clearPendingPrompt();
      return;
    }
    autoSentRef.current = pendingPrompt;
    clearPendingPrompt();
    sendRef.current(pendingPrompt);
  }, [pendingPrompt, company, companyId, clearPendingPrompt]);

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col",
        variant === "dock" ? "h-full px-3 pb-3 pt-2" : "mx-auto h-[calc(100vh-3.5rem)] max-w-5xl px-4 py-4 sm:px-6",
      )}
    >
      {variant === "page" && (
        <div className="mb-3 shrink-0">
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
            Kopilot Analitik
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Pertanyaan untuk{" "}
            <span className="font-medium text-[var(--ink)]">{company?.name ?? "perusahaan"}</span>
            {company ? ` · ${company.sector}` : ""}.
          </p>
        </div>
      )}

      <div className="mb-2 flex shrink-0 gap-2 overflow-x-auto pb-1">
        {demoCards.map((card) => (
          <button
            key={card.id}
            type="button"
            disabled={busy}
            onClick={() => send(card.prompt)}
            className="min-w-[9.5rem] shrink-0 rounded-xl border border-[var(--border)] bg-[var(--paper)] px-3 py-2 text-left transition hover:border-[var(--logo-sky)] disabled:opacity-50"
          >
            <div className="text-xs font-medium text-[var(--ink)]">{card.title}</div>
            <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-[var(--muted)]">
              {card.prompt}
            </p>
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--paper)]/70 p-3 sm:p-4">
        {messages.length === 0 && !pending && (
          <div className="flex h-full min-h-40 flex-col items-center justify-center text-center text-[var(--muted)]">
            <p className="max-w-sm text-sm">
              Pilih kartu demo atau ketik pertanyaan tentang{" "}
              {company?.name ?? "data perdagangan"}.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            streaming={m.role === "assistant" && streamingMessageId === m.id}
            onStreamComplete={() =>
              setStreamingMessageId((current) => (current === m.id ? null : current))
            }
            onStreamTick={scrollToBottom}
          />
        ))}
        {pending && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-2 shrink-0 text-sm text-[#9b2c2c]">{error}</p>}

      <form
        className="mt-2 flex shrink-0 gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Tanya tentang ${company?.name ?? "data"}…`}
          disabled={busy}
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--paper)] px-3 py-2.5 text-sm outline-none ring-[var(--accent)] focus:ring-2 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-[var(--ink)] px-4 py-2.5 text-sm font-medium text-[var(--paper)] disabled:opacity-50"
        >
          Tanya
        </button>
      </form>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="mr-4">
      <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <span className="sr-only">Merencanakan & mengeksekusi…</span>
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)] [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)] [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--muted)] [animation-delay:300ms]" />
      </div>
    </div>
  );
}

const markdownComponents = {
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
  ),
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-semibold text-[var(--ink)]">{children}</strong>
  ),
  em: ({ children }: { children?: ReactNode }) => (
    <em className="italic text-[var(--ink)]">{children}</em>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  code: ({ className, children }: { className?: string; children?: ReactNode }) => {
    const block = Boolean(className);
    return block ? (
      <code
        className={cn("block overflow-auto rounded-md bg-[var(--paper)] p-2 text-xs", className)}
      >
        {children}
      </code>
    ) : (
      <code className="rounded bg-[var(--paper)] px-1 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    );
  },
  pre: ({ children }: { children?: ReactNode }) => (
    <pre className="mb-2 overflow-auto rounded-lg bg-[var(--paper)] p-2 text-xs last:mb-0">
      {children}
    </pre>
  ),
  a: ({ href, children }: { href?: string; children?: ReactNode }) => (
    <a href={href} className="text-[var(--logo-sky)] underline underline-offset-2">
      {children}
    </a>
  ),
};

function MessageBubble({
  message,
  streaming,
  onStreamComplete,
  onStreamTick,
}: {
  message: AgentMessage;
  streaming: boolean;
  onStreamComplete: () => void;
  onStreamTick: () => void;
}) {
  const isUser = message.role === "user";
  const [visibleLen, setVisibleLen] = useState(() =>
    streaming ? 0 : message.content.length,
  );
  const onCompleteRef = useRef(onStreamComplete);
  const onTickRef = useRef(onStreamTick);
  onCompleteRef.current = onStreamComplete;
  onTickRef.current = onStreamTick;

  useEffect(() => {
    if (!streaming) {
      setVisibleLen(message.content.length);
      return;
    }

    setVisibleLen(0);
    let len = 0;
    const id = window.setInterval(() => {
      len = Math.min(message.content.length, len + CHARS_PER_TICK);
      setVisibleLen(len);
      onTickRef.current();
      if (len >= message.content.length) {
        window.clearInterval(id);
        onCompleteRef.current();
      }
    }, TICK_MS);

    return () => window.clearInterval(id);
  }, [streaming, message.content]);

  const displayed = isUser ? message.content : message.content.slice(0, visibleLen);

  return (
    <div className={isUser ? "ml-6" : "mr-2"}>
      <div
        className={
          isUser
            ? "rounded-2xl rounded-br-md bg-[var(--ink)] px-4 py-3 text-sm text-[var(--paper)]"
            : "rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--ink)]"
        }
      >
        {isUser ? (
          <div className="whitespace-pre-wrap">{displayed}</div>
        ) : (
          <div className="relative">
            <Markdown components={markdownComponents}>{displayed}</Markdown>
            {streaming && visibleLen < message.content.length && (
              <span
                aria-hidden
                className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.15em] animate-pulse bg-[var(--ink)] align-baseline"
              />
            )}
          </div>
        )}
        {!isUser && message.payload && <AssistantExtras payload={message.payload} />}
      </div>
    </div>
  );
}

function AssistantExtras({ payload }: { payload: AgentResponsePayload }) {
  return (
    <div className="mt-4 space-y-3 border-t border-[var(--border)] pt-3">
      {payload.result && (
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            Visualisasi
          </div>
          <ResultChart result={payload.result} />
        </div>
      )}
      {payload.breakdowns?.map((b, i) => (
        <div key={i}>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            Rincian: {b.plan.dimensions.join(", ") || "total"}
          </div>
          <ResultChart result={b} />
        </div>
      ))}
      {payload.queryPlan && (
        <details className="rounded-lg bg-[var(--paper)] p-3">
          <summary className="cursor-pointer text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            Rencana Kueri (QueryPlan)
          </summary>
          <pre className="mt-2 overflow-auto text-xs leading-relaxed">
            {JSON.stringify(payload.queryPlan, null, 2)}
          </pre>
        </details>
      )}
      {payload.evidence && (
        <details className="rounded-lg bg-[var(--paper)] p-3">
          <summary className="cursor-pointer text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
            Bukti
          </summary>
          <dl className="mt-2 grid gap-1 text-xs">
            <div>
              <dt className="text-[var(--muted)]">Metrik</dt>
              <dd>{payload.evidence.metric}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Definisi</dt>
              <dd>{payload.evidence.metricDefinition}</dd>
            </div>
            {payload.evidence.timeWindow && (
              <div>
                <dt className="text-[var(--muted)]">Jendela waktu</dt>
                <dd>
                  {payload.evidence.timeWindow.start} → {payload.evidence.timeWindow.end}
                </dd>
              </div>
            )}
            {payload.result && (
              <>
                <div>
                  <dt className="text-[var(--muted)]">Nilai</dt>
                  <dd>{payload.result.value}</dd>
                </div>
                {payload.result.comparisonValue != null && (
                  <div>
                    <dt className="text-[var(--muted)]">Periode sebelumnya</dt>
                    <dd>{payload.result.comparisonValue}</dd>
                  </div>
                )}
                {payload.result.deltaPct != null && (
                  <div>
                    <dt className="text-[var(--muted)]">Selisih</dt>
                    <dd>{payload.result.deltaPct.toFixed(1)}%</dd>
                  </div>
                )}
              </>
            )}
          </dl>
          <pre className="mt-2 overflow-auto rounded bg-[var(--ink)] p-2 text-[10px] text-[var(--paper)]">
            {payload.evidence.sql}
          </pre>
        </details>
      )}
      {payload.dashboard != null && (
        <div className="rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-soft)] p-3 text-xs">
          Dasbor diperbarui.{" "}
          <Link href="/dashboards" className="underline">
            Buka Dasbor →
          </Link>
        </div>
      )}
      <div className="text-xs text-[var(--muted)]">
        Jejak:{" "}
        <Link href={`/traces?id=${payload.traceId}`} className="underline">
          {payload.traceId}
        </Link>
      </div>
    </div>
  );
}
