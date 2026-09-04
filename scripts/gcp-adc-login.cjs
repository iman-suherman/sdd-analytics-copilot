/**
 * ADC login (global gcloud path), prompt for project after sign-in,
 * then copy ADC into .gcloud/ and persist GCP_* keys to .env
 */
const { spawnSync } = require("child_process");
const path = require("path");
const { syncAdcToProject } = require("./gcp-lib-adc.cjs");
const { upsertEnvKey } = require("./gcp-config.cjs");
const { generateEnv } = require("./generate-env.cjs");
const { promptGcpEmail } = require("./prompt-gcp-email.cjs");
const { promptGcpProject } = require("./prompt-gcp-project.cjs");

const root = path.join(__dirname, "..");
const shell = process.platform === "win32";

const SUPPRESSED_OUTPUT = [
  /quota project/i,
  /unexpected quota issues/i,
  /set-quota-project/i,
  /billing and quota/i,
  /still bill the project/i,
  /Updates are available for some Google Cloud CLI components/i,
  /gcloud components update/i,
];

function shouldSuppressLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return true;
  return SUPPRESSED_OUTPUT.some((pattern) => pattern.test(trimmed));
}

function emitGcloudOutput(text) {
  if (!text) return;
  for (const line of text.split("\n")) {
    if (shouldSuppressLine(line)) continue;
    process.stdout.write(`${line}\n`);
  }
}

function runGcloud(args, { quiet = false } = {}) {
  const cmd = quiet ? [...args, "--quiet"] : args;
  const r = spawnSync("gcloud", cmd, {
    stdio: "pipe",
    cwd: root,
    shell,
    env: process.env,
    encoding: "utf8",
  });

  emitGcloudOutput(r.stdout);
  emitGcloudOutput(r.stderr);

  if (r.error) throw r.error;
  if (r.status !== 0) process.exit(r.status ?? 1);
}

(async () => {
  const email = await promptGcpEmail(root);

  console.log(`\nlogin: opening browser for Google sign-in (${email})…\n`);

  runGcloud(["auth", "application-default", "login", email]);

  console.log("\nlogin: sign-in complete — select a GCP project.\n");

  const projectId = await promptGcpProject(root);
  console.log(`login: using project ${projectId}`);

  runGcloud(["config", "set", "account", email], { quiet: true });
  runGcloud(["config", "set", "project", projectId], { quiet: true });
  runGcloud(["auth", "application-default", "set-quota-project", projectId], { quiet: true });

  if (!syncAdcToProject(root)) process.exit(1);

  const envResult = generateEnv(root, { quiet: true });
  if (envResult.created) {
    console.log("login: generate-env completed — created .env from .env.example");
  } else {
    console.log("login: generate-env completed — using existing .env");
  }

  upsertEnvKey(root, "GCP_PROJECT_ID", projectId, { logPrefix: "login" });
  upsertEnvKey(root, "GCP_USER_EMAIL", email, { logPrefix: "login" });
  upsertEnvKey(root, "GOOGLE_APPLICATION_CREDENTIALS", ".gcloud/application_default_credentials.json", {
    logPrefix: "login",
  });

  console.log("login: done");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
