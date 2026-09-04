import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { SemanticModelSchema, type SemanticModel } from "./semantic-schema";

let cached: SemanticModel | null = null;

export function loadSemanticModel(force = false): SemanticModel {
  if (cached && !force) return cached;
  const filePath = path.join(process.cwd(), "semantic", "commerce.yaml");
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = YAML.parse(raw);
  cached = SemanticModelSchema.parse(parsed);
  return cached;
}

export function listMetrics(model = loadSemanticModel()) {
  return Object.entries(model.metrics).map(([id, def]) => ({
    id,
    ...def,
  }));
}

export function listDimensions(model = loadSemanticModel()) {
  return Object.entries(model.dimensions).map(([id, def]) => ({
    id,
    ...def,
  }));
}
