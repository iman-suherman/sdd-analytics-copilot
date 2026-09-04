/**
 * Export demo.sqlite → data/samples/{company}/… with business-specific columns.
 *
 * Usage: npx tsx data/export-csv.ts
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import {
  CANONICAL_COLUMNS,
  COMPANY_CSV_PROFILES,
  type CanonicalTable,
} from "./csv-profiles";
import { rowsToCsv } from "./csv-io";

const ROOT = process.cwd();
const DB_PATH = path.join(ROOT, "data", "demo.sqlite");
const SAMPLES_DIR = path.join(ROOT, "data", "samples");

function invertMap(columns: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [csv, sql] of Object.entries(columns)) {
    out[sql] = csv;
  }
  return out;
}

function exportTable(
  db: Database.Database,
  companyId: string,
  table: CanonicalTable,
  sqlToCsv: Record<string, string>,
  csvHeaders: string[],
): Record<string, unknown>[] {
  const sqlCols = CANONICAL_COLUMNS[table];
  const rows = db
    .prepare(`SELECT ${sqlCols.join(", ")} FROM ${table} WHERE company_id = ?`)
    .all(companyId) as Record<string, unknown>[];

  return rows.map((row) => {
    const out: Record<string, unknown> = {};
    for (const sqlCol of sqlCols) {
      const csvHeader = sqlToCsv[sqlCol];
      if (!csvHeader) continue;
      out[csvHeader] = row[sqlCol];
    }
    // keep header order
    const ordered: Record<string, unknown> = {};
    for (const h of csvHeaders) ordered[h] = out[h] ?? "";
    return ordered;
  });
}

export function exportSampleCsv(dbPath = DB_PATH, samplesDir = SAMPLES_DIR) {
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Missing ${dbPath} — run npm run db:seed first (generator) or restore DB`);
  }

  const db = new Database(dbPath, { readonly: true });
  fs.mkdirSync(samplesDir, { recursive: true });

  const companies = db.prepare(`SELECT * FROM companies ORDER BY id`).all() as {
    id: string;
    name: string;
    slug: string;
    sector: string;
    tagline: string;
  }[];

  const companiesCsv = rowsToCsv(
    ["id", "name", "slug", "sector", "tagline"],
    companies,
  );
  fs.writeFileSync(path.join(samplesDir, "companies.csv"), companiesCsv, "utf8");

  const summary: Record<string, Record<string, number>> = {};

  for (const company of companies) {
    const profile = COMPANY_CSV_PROFILES[company.id];
    if (!profile) {
      console.warn(`export-csv: no CSV profile for ${company.id}, skipping`);
      continue;
    }

    const dir = path.join(samplesDir, company.id);
    fs.mkdirSync(dir, { recursive: true });
    summary[company.id] = {};

    for (const table of Object.keys(profile.files) as CanonicalTable[]) {
      const file = profile.files[table];
      const sqlToCsv = invertMap(file.columns);
      const csvHeaders = Object.keys(file.columns);
      const rows = exportTable(db, company.id, table, sqlToCsv, csvHeaders);
      const csv = rowsToCsv(csvHeaders, rows);
      fs.writeFileSync(path.join(dir, file.filename), csv, "utf8");
      summary[company.id]![file.filename] = rows.length;
    }

    fs.writeFileSync(
      path.join(dir, "README.md"),
      `# ${company.name} sample CSVs\n\n` +
        `${profile.label}\n\n` +
        `| File | Rows |\n|------|------|\n` +
        Object.entries(summary[company.id]!)
          .map(([f, n]) => `| \`${f}\` | ${n} |`)
          .join("\n") +
        `\n\nColumns use this company's business vocabulary; \`npm run db:seed\` maps them into canonical SQLite tables.\n`,
      "utf8",
    );
  }

  db.close();

  fs.writeFileSync(
    path.join(samplesDir, "README.md"),
    `# Sample commerce CSVs\n\n` +
      `Exported from \`demo.sqlite\`. Each company folder uses **different column names** suited to its sector.\n\n` +
      `Regenerate:\n\n\`\`\`bash\nnpm run data:export-csv\n\`\`\`\n\n` +
      `Seed SQLite from these files:\n\n\`\`\`bash\nnpm run db:seed\n\`\`\`\n`,
    "utf8",
  );

  return { companies: companies.length, summary };
}

const isDirect =
  typeof process !== "undefined" &&
  process.argv[1] &&
  process.argv[1].includes("export-csv");

if (isDirect) {
  const result = exportSampleCsv();
  console.log("Exported sample CSVs:", result);
}
