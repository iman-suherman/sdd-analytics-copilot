import { z } from "zod";

export const MetricFilterSchema = z.object({
  field: z.string(),
  op: z.enum(["eq", "neq", "in", "gt", "gte", "lt", "lte"]),
  value: z.union([z.string(), z.number(), z.array(z.string())]),
});

export const MetricDefSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  type: z.enum(["sum", "count", "count_distinct", "avg", "calculated"]),
  field: z.string().optional(),
  filters: z.array(MetricFilterSchema).optional(),
  formula: z.string().optional(),
});

export const DimensionDefSchema = z.object({
  label: z.string(),
  field: z.string(),
  type: z.enum(["categorical", "time"]).default("categorical"),
});

export const SemanticModelSchema = z.object({
  model: z.string(),
  label: z.string(),
  description: z.string().optional(),
  tables: z.record(z.string(), z.unknown()),
  metrics: z.record(z.string(), MetricDefSchema),
  dimensions: z.record(z.string(), DimensionDefSchema),
});

export type SemanticModel = z.infer<typeof SemanticModelSchema>;
export type MetricDef = z.infer<typeof MetricDefSchema>;
export type DimensionDef = z.infer<typeof DimensionDefSchema>;
