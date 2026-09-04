const enabled = Boolean(process.stdout.isTTY && !process.env.NO_COLOR);

const codes = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
};

function color(text, ...styles) {
  if (!enabled || styles.length === 0) return text;
  const open = styles.map((style) => codes[style] ?? codes.reset).join("");
  return `${open}${text}${codes.reset}`;
}

function highlightDefault(text) {
  return color(text, "bold", "cyan");
}

function highlightDefaultRow(text) {
  return color(text, "bold", "green");
}

function dim(text) {
  return color(text, "dim");
}

module.exports = {
  color,
  dim,
  highlightDefault,
  highlightDefaultRow,
};
