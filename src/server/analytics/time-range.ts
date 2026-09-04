/** Demo clock: treat "today" as 2026-09-05 so last_month = August 2026. */
export const DEMO_AS_OF = "2026-09-05";

function parseIso(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y!, month: m!, day: d! };
}

function formatIso(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addMonths(year: number, month: number, delta: number) {
  const idx = year * 12 + (month - 1) + delta;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export type ResolvedWindow = {
  start: string;
  end: string;
  label: string;
};

export function resolveTimeRange(
  range: string | undefined,
  asOf = DEMO_AS_OF,
): ResolvedWindow | null {
  if (!range || range === "all_time") return null;

  const asOfDate = parseIso(asOf);
  const { year, month, day } = asOfDate;

  if (range === "last_month" || range === "previous_month") {
    const prev = addMonths(year, month, -1);
    const start = formatIso(prev.year, prev.month, 1);
    const endExclusive = formatIso(year, month, 1);
    return { start, end: endExclusive, label: `${prev.year}-${String(prev.month).padStart(2, "0")}` };
  }

  if (range === "last_7_days") {
    const end = new Date(Date.UTC(year, month - 1, day + 1));
    const start = new Date(Date.UTC(year, month - 1, day - 6));
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      label: "last_7_days",
    };
  }

  if (range === "last_30_days") {
    const end = new Date(Date.UTC(year, month - 1, day + 1));
    const start = new Date(Date.UTC(year, month - 1, day - 29));
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      label: "last_30_days",
    };
  }

  if (range === "last_90_days") {
    const end = new Date(Date.UTC(year, month - 1, day + 1));
    const start = new Date(Date.UTC(year, month - 1, day - 89));
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
      label: "last_90_days",
    };
  }

  if (range === "last_6_months") {
    const startMonth = addMonths(year, month, -6);
    return {
      start: formatIso(startMonth.year, startMonth.month, 1),
      end: formatIso(year, month, 1),
      label: "last_6_months",
    };
  }

  if (range === "last_12_months") {
    const startMonth = addMonths(year, month, -12);
    return {
      start: formatIso(startMonth.year, startMonth.month, 1),
      end: formatIso(year, month, 1),
      label: "last_12_months",
    };
  }

  if (range === "ytd") {
    return {
      start: formatIso(year, 1, 1),
      end: formatIso(year, month, Math.min(day + 1, daysInMonth(year, month))),
      label: "ytd",
    };
  }

  return null;
}

export function previousPeriodWindow(window: ResolvedWindow): ResolvedWindow {
  const start = parseIso(window.start);
  const end = parseIso(window.end);
  const startIdx = start.year * 12 + (start.month - 1);
  const endIdx = end.year * 12 + (end.month - 1);
  const length = endIdx - startIdx || 1;
  const prevEnd = addMonths(start.year, start.month, 0);
  const prevStart = addMonths(start.year, start.month, -length);
  return {
    start: formatIso(prevStart.year, prevStart.month, 1),
    end: formatIso(prevEnd.year, prevEnd.month, 1),
    label: `previous_of_${window.label}`,
  };
}
