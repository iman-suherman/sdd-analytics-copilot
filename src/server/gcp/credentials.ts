import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const out: Record<string, string> = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (value) out[key] = value;
  }
  return out;
}

/** Merge `.env` into process.env without overriding existing keys. */
export function loadDotEnv(): void {
  const fromFile = parseEnvFile(path.join(ROOT, ".env"));
  for (const [key, value] of Object.entries(fromFile)) {
    if (process.env[key] == null || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

/**
 * Prefer repo-local ADC from `npm run login` (`.gcloud/…`).
 * Resolves relative GOOGLE_APPLICATION_CREDENTIALS against the repo root.
 */
export function applyProjectAdc(): string | null {
  loadDotEnv();

  const configured = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  if (configured) {
    const resolved = path.isAbsolute(configured)
      ? configured
      : path.join(ROOT, configured);
    if (fs.existsSync(resolved)) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = resolved;
      return resolved;
    }
  }

  const local = path.join(ROOT, ".gcloud", "application_default_credentials.json");
  if (fs.existsSync(local)) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = local;
    return local;
  }

  return null;
}

export function resolveGcpProjectId(): string | null {
  loadDotEnv();
  return (
    process.env.GCP_PROJECT_ID?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
    null
  );
}

export function resolveVertexLocation(): string {
  loadDotEnv();
  return (
    process.env.VERTEX_AI_LOCATION?.trim() ||
    process.env.GOOGLE_CLOUD_LOCATION?.trim() ||
    "global"
  );
}

export function resolveVertexModel(): string {
  loadDotEnv();
  return process.env.VERTEX_MODEL?.trim() || "gemini-2.5-flash";
}

export type AgentBackend = "vertex" | "mock";

/**
 * Default: Vertex when ADC + project exist; otherwise mock.
 * Override with AGENT_BACKEND=vertex|mock.
 */
export function resolveAgentBackend(): AgentBackend {
  loadDotEnv();
  const forced = process.env.AGENT_BACKEND?.trim().toLowerCase();
  if (forced === "mock" || forced === "vertex") return forced;

  const adc = applyProjectAdc();
  const project = resolveGcpProjectId();
  return adc && project ? "vertex" : "mock";
}
