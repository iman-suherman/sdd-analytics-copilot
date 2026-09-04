"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CopilotContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Prompt queued to send once the dock chat is ready. */
  pendingPrompt: string | null;
  ask: (prompt?: string) => void;
  clearPendingPrompt: () => void;
};

const CopilotContext = createContext<CopilotContextValue | null>(null);

export function CopilotProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const clearPendingPrompt = useCallback(() => setPendingPrompt(null), []);

  const ask = useCallback((prompt?: string) => {
    if (prompt?.trim()) setPendingPrompt(prompt.trim());
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({ open, setOpen, pendingPrompt, ask, clearPendingPrompt }),
    [open, pendingPrompt, ask, clearPendingPrompt],
  );

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>;
}

export function useCopilot() {
  const ctx = useContext(CopilotContext);
  if (!ctx) throw new Error("useCopilot must be used within CopilotProvider");
  return ctx;
}
