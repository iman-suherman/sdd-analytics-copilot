import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
