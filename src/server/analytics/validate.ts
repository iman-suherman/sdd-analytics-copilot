import type { QueryPlan } from "./query-plan";
import { loadSemanticModel } from "./semantic-loader";
import type { SemanticModel } from "./semantic-schema";

export class QueryPlanValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QueryPlanValidationError";
  }
}

export function validateQueryPlan(
  plan: QueryPlan,
  model: SemanticModel = loadSemanticModel(),
): QueryPlan {
  if (!model.metrics[plan.metric]) {
    throw new QueryPlanValidationError(
      `Unknown metric "${plan.metric}". Allowed: ${Object.keys(model.metrics).join(", ")}`,
    );
  }

  const metric = model.metrics[plan.metric]!;
  if (metric.type === "calculated") {
    // Calculated metrics are expanded at compile time; still valid as a plan metric.
  }

  for (const dim of plan.dimensions) {
    if (!model.dimensions[dim]) {
      throw new QueryPlanValidationError(
        `Unknown dimension "${dim}". Allowed: ${Object.keys(model.dimensions).join(", ")}`,
      );
    }
  }

  for (const filter of plan.filters ?? []) {
    if (!model.dimensions[filter.dimension]) {
      throw new QueryPlanValidationError(
        `Unknown filter dimension "${filter.dimension}"`,
      );
    }
  }

  if (plan.time?.dimension && !model.dimensions[plan.time.dimension]) {
    throw new QueryPlanValidationError(
      `Unknown time dimension "${plan.time.dimension}"`,
    );
  }

  if (plan.time?.dimension) {
    const dim = model.dimensions[plan.time.dimension]!;
    if (dim.type !== "time") {
      throw new QueryPlanValidationError(
        `Dimension "${plan.time.dimension}" is not a time dimension`,
      );
    }
  }

  return plan;
}
