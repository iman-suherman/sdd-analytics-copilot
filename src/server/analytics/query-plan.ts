import { z } from "zod";

export const TimeRangeSchema = z.enum([
  "last_month",
  "previous_month",
  "last_7_days",
  "last_30_days",
  "last_90_days",
  "last_6_months",
  "last_12_months",
  "ytd",
  "all_time",
]);

export const QueryPlanSchema = z.object({
  metric: z.string(),
  dimensions: z.array(z.string()).default([]),
  filters: z
    .array(
      z.object({
        dimension: z.string(),
        op: z.enum(["eq", "neq", "in"]).default("eq"),
        value: z.union([z.string(), z.array(z.string())]),
      }),
    )
    .default([]),
  time: z
    .object({
      dimension: z.string().default("order_date"),
      range: TimeRangeSchema.optional(),
      start: z.string().optional(),
      end: z.string().optional(),
      granularity: z.enum(["day", "week", "month"]).optional(),
    })
    .optional(),
  comparison: z.enum(["previous_period", "none"]).optional(),
  limit: z.number().int().positive().max(1000).optional(),
});

export type QueryPlan = z.infer<typeof QueryPlanSchema>;
export type TimeRange = z.infer<typeof TimeRangeSchema>;
