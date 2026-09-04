import fs from "node:fs";
import { seedDatabase } from "../../../data/seed";
import { getDbPath, getSqlite, resetDbConnection } from "./client";

let ready = false;

export function ensureDatabase() {
  if (ready) {
    getSqlite();
    return;
  }
  const dbPath = getDbPath();
  if (!fs.existsSync(dbPath)) {
    seedDatabase(dbPath);
  } else {
    const db = getSqlite();
    const tables = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table'`)
      .all() as { name: string }[];
    const names = new Set(tables.map((t) => t.name));
    if (!names.has("orders") || !names.has("companies")) {
      resetDbConnection();
      seedDatabase(dbPath);
    } else {
      // Migrasi kasar: schema lama tanpa company_id → reseed
      const cols = db.prepare(`PRAGMA table_info(orders)`).all() as { name: string }[];
      if (!cols.some((c) => c.name === "company_id")) {
        resetDbConnection();
        seedDatabase(dbPath);
      }
    }
  }
  getSqlite();
  ready = true;
}

export function resetEnsureFlag() {
  ready = false;
  resetDbConnection();
}
