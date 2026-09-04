const readline = require("readline/promises");
const { spawnSync } = require("child_process");
const { stdin, stdout } = require("process");
const { resolveLocalGcpProjectId } = require("./gcp-config.cjs");
const { dim, highlightDefault, highlightDefaultRow } = require("./terminal-colors.cjs");

const shell = process.platform === "win32";
const USE_DEFAULT_HINT = "(enter a new value or hit Enter to use it)";

function listGcpProjects() {
  const r = spawnSync(
    "gcloud",
    [
      "projects",
      "list",
      "--format=value(projectId)",
      "--filter=lifecycleState:ACTIVE",
      "--sort-by=projectId",
    ],
    { encoding: "utf8", shell }
  );

  if (r.status !== 0 || !r.stdout?.trim()) {
    return [];
  }

  return [...new Set(r.stdout.trim().split("\n").map((id) => id.trim()).filter(Boolean))];
}

function isValidProjectId(projectId) {
  return /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId);
}

function printProjectList(projects, defaultId) {
  if (projects.length === 0) {
    return;
  }

  console.log("\nAvailable GCP projects:");
  projects.forEach((projectId, index) => {
    const line = `  ${index + 1}. ${projectId}`;
    if (defaultId && projectId === defaultId) {
      console.log(highlightDefaultRow(`${line} (default)`));
      return;
    }
    console.log(line);
  });
}

/**
 * @param {string} repoRoot
 * @returns {Promise<string>}
 */
async function promptGcpProject(repoRoot) {
  const defaultId = resolveLocalGcpProjectId(repoRoot);
  const projects = listGcpProjects();
  if (defaultId && !projects.includes(defaultId)) {
    projects.unshift(defaultId);
  }
  const rl = readline.createInterface({ input: stdin, output: stdout });

  try {
    printProjectList(projects, defaultId);

    const prompt = defaultId
      ? `\nGCP project ID [${highlightDefault(defaultId)}] ${dim(USE_DEFAULT_HINT)}: `
      : "\nGCP project ID (required): ";
    const raw = await rl.question(prompt);
    const choice = String(raw).trim();

    if (!choice) {
      if (defaultId) return defaultId;
      console.error("Error: project ID is required.");
      process.exit(1);
    }

    if (/^\d+$/.test(choice) && projects.length > 0) {
      const index = Number(choice);
      if (index >= 1 && index <= projects.length) {
        return projects[index - 1];
      }
      console.error("Error: invalid selection.");
      process.exit(1);
    }

    if (!isValidProjectId(choice)) {
      console.error("Error: project ID must match GCP naming rules.");
      process.exit(1);
    }

    return choice;
  } finally {
    rl.close();
  }
}

module.exports = { promptGcpProject, listGcpProjects };
