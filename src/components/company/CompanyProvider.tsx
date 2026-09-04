"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Company = {
  id: string;
  name: string;
  slug: string;
  sector: string;
  tagline: string;
};

type CompanyContextValue = {
  companies: Company[];
  companyId: string;
  company: Company | null;
  setCompanyId: (id: string) => void;
  ready: boolean;
  companyFetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

const STORAGE_KEY = "sdd-company-id";
const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyIdState] = useState("tokoraya");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/companies");
        const data = await res.json();
        const list = (data.companies ?? []) as Company[];
        setCompanies(list);
        const stored =
          typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
        const initial =
          (stored && list.some((c) => c.id === stored) && stored) ||
          data.defaultCompanyId ||
          list[0]?.id ||
          "tokoraya";
        setCompanyIdState(initial);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setCompanyId = useCallback((id: string) => {
    setCompanyIdState(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  const companyFetch = useCallback(
    (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      headers.set("x-company-id", companyId);
      return fetch(input, { ...init, headers });
    },
    [companyId],
  );

  const company = useMemo(
    () => companies.find((c) => c.id === companyId) ?? null,
    [companies, companyId],
  );

  const value = useMemo(
    () => ({ companies, companyId, company, setCompanyId, ready, companyFetch }),
    [companies, companyId, company, setCompanyId, ready, companyFetch],
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany harus dipakai di dalam CompanyProvider");
  return ctx;
}
