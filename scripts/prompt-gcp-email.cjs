const readline = require("readline/promises");
const path = require("path");
const { stdin, stdout } = require("process");
const { resolveGcpUserEmail } = require("./gcp-config.cjs");
const { dim, highlightDefault } = require("./terminal-colors.cjs");

const USE_DEFAULT_HINT = "(enter a new value or hit Enter to use it)";

/**
 * @param {string} [repoRoot]
 * @returns {Promise<string>}
 */
async function promptGcpEmail(repoRoot = path.join(__dirname, "..")) {
  const defaultEmail = resolveGcpUserEmail(repoRoot);
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    const prompt = defaultEmail
      ? `GCP user email [${highlightDefault(defaultEmail)}] ${dim(USE_DEFAULT_HINT)}: `
      : "GCP user email: ";
    const raw = await rl.question(prompt);
    const email = String(raw).trim() || defaultEmail;
    if (!email) {
      console.error("Error: email is required.");
      process.exit(1);
    }
    return email;
  } finally {
    rl.close();
  }
}

module.exports = { promptGcpEmail };
