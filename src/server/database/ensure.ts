import fs from "node:fs";
import { seedDatabase } from "../../../data/seed";
import { getDbPath, getSqlite, resetDbConnection } from "./client";

let ready = false;

/**
 * Fallback if seed cannot populate (should be rare once P1 seed is present).
 * P2 prompt preferred dynamic import of seed; static import is used so sync
 * API handlers (`ensureDatabase()`) work under Next.js bundling.
 */
function createSchemaOnly() {
  const db = getSqlite();
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      sector TEXT NOT NULL,
      tagline TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      segment TEXT NOT NULL,
      region TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      order_date TEXT NOT NULL,
      status TEXT NOT NULL,
      net_amount REAL NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      payload_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );
    CREATE TABLE IF NOT EXISTS dashboards (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      title TEXT NOT NULL,
      spec_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );
    CREATE TABLE IF NOT EXISTS agent_traces (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      conversation_id TEXT,
      message_id TEXT,
      prompt TEXT NOT NULL,
      steps_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );
  `);
}

function seedOrCreateSchema(dbPath: string) {
  try {
    seedDatabase(dbPath);
  } catch (err) {
    console.warn(
      "[ensureDatabase] seedDatabase failed; creating schema only (P1 owns data/seed).",
      err instanceof Error ? err.message : err,
    );
    resetDbConnection();
    if (fs.existsSync(dbPath)) {
      try {
        fs.unlinkSync(dbPath);
      } catch {
        /* ignore */
      }
    }
    createSchemaOnly();
  }
}

export function ensureDatabase() {
  if (ready) {
    getSqlite();
    return;
  }
  const dbPath = getDbPath();
  if (!fs.existsSync(dbPath)) {
    seedOrCreateSchema(dbPath);
  } else {
    const db = getSqlite();
    const tables = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table'`)
      .all() as { name: string }[];
    const names = new Set(tables.map((t) => t.name));
    if (!names.has("orders") || !names.has("companies")) {
      resetDbConnection();
      seedOrCreateSchema(dbPath);
    } else {
      // Migrasi kasar: schema lama tanpa company_id → reseed
      const cols = db.prepare(`PRAGMA table_info(orders)`).all() as { name: string }[];
      if (!cols.some((c) => c.name === "company_id")) {
        resetDbConnection();
        seedOrCreateSchema(dbPath);
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
