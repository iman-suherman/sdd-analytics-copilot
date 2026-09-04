import { z } from "zod";

export const WidgetSpecSchema = z.object({
  id: z.string(),
  type: z.enum(["kpi", "line", "bar", "table"]),
  metric: z.string(),
  dimension: z.string().optional(),
  granularity: z.enum(["day", "week", "month"]).optional(),
  comparison: z.enum(["previous_period", "none"]).optional(),
  title: z.string().optional(),
});

export const DashboardSpecSchema = z.object({
  id: z.string(),
  title: z.string(),
  widgets: z.array(WidgetSpecSchema),
});

export const DashboardPatchSchema = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("replace_widget"),
    widgetId: z.string(),
    widget: WidgetSpecSchema.partial().extend({
      type: z.enum(["kpi", "line", "bar", "table"]).optional(),
      metric: z.string().optional(),
    }),
  }),
  z.object({
    operation: z.literal("add_widget"),
    widget: WidgetSpecSchema,
  }),
  z.object({
    operation: z.literal("remove_widget"),
    widgetId: z.string(),
  }),
  z.object({
    operation: z.literal("set_title"),
    title: z.string(),
  }),
]);

export type WidgetSpec = z.infer<typeof WidgetSpecSchema>;
export type DashboardSpec = z.infer<typeof DashboardSpecSchema>;
export type DashboardPatch = z.infer<typeof DashboardPatchSchema>;
