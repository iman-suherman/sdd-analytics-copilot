import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const DB_PATH = path.join(process.cwd(), "data", "demo.sqlite");

let sqlite: Database.Database | null = null;

export function getSqlite(): Database.Database {
  if (!sqlite) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    sqlite = new Database(DB_PATH);
    sqlite.pragma("journal_mode = DELETE");
    sqlite.pragma("foreign_keys = ON");
  }
  return sqlite;
}

export function getDb() {
  return drizzle(getSqlite(), { schema });
}

export function getDbPath() {
  return DB_PATH;
}

/** Close and drop the cached connection (tests / re-seed). */
export function resetDbConnection() {
  if (sqlite) {
    try {
      sqlite.close();
    } catch {
      /* already closed */
    }
    sqlite = null;
  }
}
