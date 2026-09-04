/**
 * Resolve GCP project ID from env or .env / .env.example
 */
const fs = require("fs");
const path = require("path");

const KEYS = ["GCP_PROJECT_ID", "GOOGLE_CLOUD_PROJECT"];
const USER_EMAIL_KEY = "GCP_USER_EMAIL";
const DEFAULT_GCP_PROJECT_ID = "personal-suherman";

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (value) out[key] = value;
  }
  return out;
}

function loadLocalEnv(repoRoot) {
  return parseEnvFile(path.join(repoRoot, ".env"));
}

function resolveGcpUserEmail(repoRoot) {
  const fromEnv = process.env[USER_EMAIL_KEY];
  if (fromEnv) return fromEnv;
  return loadLocalEnv(repoRoot)[USER_EMAIL_KEY] || null;
}

function buildGcpCliEnv(repoRoot, baseEnv = process.env) {
  const env = { ...baseEnv };
  const local = loadLocalEnv(repoRoot);

  const email = env[USER_EMAIL_KEY] || local[USER_EMAIL_KEY];
  if (email) {
    env.CLOUDSDK_CORE_ACCOUNT = email;
  }

  let projectId = null;
  for (const key of KEYS) {
    if (env[key]) {
      projectId = env[key];
      break;
    }
    if (local[key]) {
      projectId = local[key];
      break;
    }
  }
  if (projectId) {
    env.CLOUDSDK_CORE_PROJECT = projectId;
    env.GOOGLE_CLOUD_PROJECT = projectId;
  }

  const adc = env.GOOGLE_APPLICATION_CREDENTIALS || local.GOOGLE_APPLICATION_CREDENTIALS;
  if (adc) {
    const adcPath = path.isAbsolute(adc) ? adc : path.join(repoRoot, adc);
    if (fs.existsSync(adcPath)) {
      env.GOOGLE_APPLICATION_CREDENTIALS = adcPath;
    }
  }

  return env;
}

function resolveLocalGcpProjectId(repoRoot) {
  const local = loadLocalEnv(repoRoot);
  for (const key of KEYS) {
    if (local[key]) return local[key];
  }
  const example = parseEnvFile(path.join(repoRoot, ".env.example"));
  for (const key of KEYS) {
    if (example[key]) return example[key];
  }
  return DEFAULT_GCP_PROJECT_ID;
}

function resolveGcpProjectId(repoRoot) {
  for (const key of KEYS) {
    if (process.env[key]) return process.env[key];
  }

  const local = resolveLocalGcpProjectId(repoRoot);
  if (local) return local;

  return DEFAULT_GCP_PROJECT_ID;
}

function formatEnvValue(value) {
  const text = String(value);
  if (/[\s#"'\\]/.test(text)) {
    return `'${text.replace(/'/g, "'\\''")}'`;
  }
  return text;
}

function upsertEnvKey(repoRoot, key, value, { quiet = false, logPrefix = "generate-env" } = {}) {
  const envPath = path.join(repoRoot, ".env");
  const line = `${key}=${formatEnvValue(value)}`;

  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, `${line}\n`, "utf8");
    if (!quiet) console.log(`${logPrefix}: wrote`, envPath);
    return;
  }

  const content = fs.readFileSync(envPath, "utf8");
  const lines = content.split("\n");
  let found = false;

  const updated = [];
  for (const entry of lines) {
    const trimmed = entry.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      updated.push(entry);
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      updated.push(entry);
      continue;
    }
    const entryKey = trimmed.slice(0, eq).trim();
    if (entryKey === key) {
      if (!found) {
        updated.push(line);
        found = true;
      }
      continue;
    }
    updated.push(entry);
  }

  if (!found) {
    updated.push(line);
  }

  fs.writeFileSync(envPath, updated.join("\n").replace(/\n?$/, "\n"), "utf8");
  if (!quiet) {
    console.log(`${logPrefix}: updated`, envPath, `(${key}=…)`);
  }
}

module.exports = {
  parseEnvFile,
  loadLocalEnv,
  resolveGcpUserEmail,
  resolveLocalGcpProjectId,
  resolveGcpProjectId,
  buildGcpCliEnv,
  formatEnvValue,
  upsertEnvKey,
  DEFAULT_GCP_PROJECT_ID,
};
