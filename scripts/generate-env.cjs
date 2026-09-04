/**
 * Ensure .env exists from .env.example (no Cloud Secret Manager).
 */
const fs = require("fs");
const path = require("path");

function resolveExamplePath(repoRoot) {
  const envExample = path.join(repoRoot, ".env.example");
  if (fs.existsSync(envExample)) return envExample;
  const alt = path.join(repoRoot, ".env-example");
  if (fs.existsSync(alt)) return alt;
  return null;
}

/**
 * @param {string} repoRoot
 * @param {{ force?: boolean, quiet?: boolean }} [options]
 */
function generateEnv(repoRoot, { force = false, quiet = false } = {}) {
  const examplePath = resolveExamplePath(repoRoot);
  const envPath = path.join(repoRoot, ".env");
  const envExists = fs.existsSync(envPath);

  if (!examplePath) {
    console.error("generate-env: .env.example not found in", repoRoot);
    process.exit(1);
  }

  if (force || !envExists) {
    fs.copyFileSync(examplePath, envPath);
    if (!quiet) {
      console.log("generate-env: wrote", envPath, "from", path.basename(examplePath));
    }
  } else if (!quiet) {
    console.log("generate-env: keeping existing .env (use --force to reset from .env.example)");
  }

  return {
    created: !envExists || force,
    skipped: envExists && !force,
    path: envPath,
  };
}

if (require.main === module) {
  const root = path.join(__dirname, "..");
  const force = process.argv.includes("--force");
  generateEnv(root, { force });
}

module.exports = { generateEnv };
