/**
 * Client-owned shapes mirroring OpenAPI / domain contracts.
 * UI must not import from `@/server/**` (owned by other regen agents).
 */

export type QueryPlan = {
  metric: string;
  dimensions: string[];
  filters?: Array<{
    dimension: string;
    op?: "eq" | "neq" | "in";
    value: string | string[];
  }>;
  time?: {
    dimension?: string;
    range?: string;
    start?: string;
    end?: string;
    granularity?: "day" | "week" | "month";
  };
  comparison?: "previous_period" | "none";
  limit?: number;
};

export type Evidence = {
  metric: string;
  metricDefinition: string;
  filters: string[];
  timeWindow: { start: string; end: string; label: string } | null;
  comparisonWindow: { start: string; end: string; label: string } | null;
  sql: string;
  params: unknown[];
};

export type ChartRecommendation = {
  type: "kpi" | "line" | "bar" | "table";
  metric: string;
  dimension?: string;
  granularity?: "day" | "week" | "month";
};

export type AnalyticsResult = {
  plan: QueryPlan;
  rows: Record<string, unknown>[];
  value: number | null;
  comparisonValue: number | null;
  deltaPct: number | null;
  evidence: Evidence;
  visualisation: ChartRecommendation;
};

export type WidgetSpec = {
  id: string;
  type: "kpi" | "line" | "bar" | "table";
  metric: string;
  dimension?: string;
  granularity?: "day" | "week" | "month";
  comparison?: "previous_period" | "none";
  title?: string;
};

export type DashboardSpec = {
  id: string;
  title: string;
  widgets: WidgetSpec[];
};

export type AgentResponsePayload = {
  answer: string;
  queryPlan?: QueryPlan;
  result?: AnalyticsResult;
  breakdowns?: AnalyticsResult[];
  dashboard?: unknown;
  dashboardPatch?: unknown;
  visualisation?: ChartRecommendation;
  evidence?: Evidence;
  traceId: string;
};

export type AgentMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  payload?: AgentResponsePayload | null;
  createdAt: string;
};

export type TraceStep = {
  name: string;
  durationMs: number;
  detail?: Record<string, unknown>;
  sql?: string;
  params?: unknown[];
};

export type AgentTrace = {
  id: string;
  companyId: string | null;
  conversationId: string | null;
  messageId: string | null;
  prompt: string;
  steps: TraceStep[];
  createdAt: string;
};
