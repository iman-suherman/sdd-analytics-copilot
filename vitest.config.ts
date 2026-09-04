import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    fileParallelism: false,
    env: {
      // Keep acceptance/evals deterministic offline.
      AGENT_BACKEND: "mock",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
