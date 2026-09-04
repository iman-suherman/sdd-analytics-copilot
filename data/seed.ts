/**
 * Seed demo.sqlite from data/samples CSV (preferred) or procedural generator.
 *
 * CSV layouts differ per company sector (see data/csv-profiles.ts).
 * Export from an existing DB: npm run data:export-csv
 */
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { parseCsv } from "./csv-io";
import {
  CANONICAL_COLUMNS,
  COMPANY_CSV_PROFILES,
  type CanonicalTable,
} from "./csv-profiles";

const DB_PATH = path.join(process.cwd(), "data", "demo.sqlite");
const SAMPLES_DIR = path.join(process.cwd(), "data", "samples");

const REGIONS = ["Jabodetabek", "Jawa", "Sumatera", "Indonesia Timur"] as const;
const SEGMENTS = ["Korporasi", "Menengah", "UMKM"] as const;
const CATEGORIES = ["Elektronik", "Fashion", "F&B", "Rumah Tangga"] as const;
const STATUSES = ["completed", "completed", "completed", "completed", "cancelled"] as const;

/** Merek fiktif — bukan afiliasi dengan perusahaan sungguhan. */
export const SAMPLE_COMPANIES = [
  {
    id: "tokoraya",
    name: "TokoRaya Digital",
    slug: "tokoraya",
    sector: "Marketplace",
    tagline: "Belanja lokal, jangkauan nusantara",
    seed: 42,
    customerCount: 500,
    productCount: 50,
    ordersPerMonth: 420,
    augustSumateraDrop: true,
  },
  {
    id: "gocepat",
    name: "GoCepat Nusantara",
    slug: "gocepat",
    sector: "Super-app & On-demand",
    tagline: "Antar apa saja, kapan saja",
    seed: 101,
    customerCount: 450,
    productCount: 40,
    ordersPerMonth: 380,
    augustSumateraDrop: false,
  },
  {
    id: "bukadagang",
    name: "BukaDagang",
    slug: "bukadagang",
    sector: "Marketplace UMKM",
    tagline: "Mitra dagang warga",
    seed: 77,
    customerCount: 400,
    productCount: 45,
    ordersPerMonth: 310,
    augustSumateraDrop: true,
  },
  {
    id: "belinusa",
    name: "BeliNusa",
    slug: "belinusa",
    sector: "E-commerce",
    tagline: "Pilihan lengkap untuk keluarga Indonesia",
    seed: 55,
    customerCount: 480,
    productCount: 55,
    ordersPerMonth: 400,
    augustSumateraDrop: false,
  },
  {
    id: "jelajahid",
    name: "JelajahID",
    slug: "jelajahid",
    sector: "Travel & Lifestyle",
    tagline: "Liburan dalam negeri jadi mudah",
    seed: 88,
    customerCount: 350,
    productCount: 35,
    ordersPerMonth: 260,
    augustSumateraDrop: false,
  },
  {
    id: "angkutprima",
    name: "AngkutPrima",
    slug: "angkutprima",
    sector: "Logistik",
    tagline: "Kiriman andal ke seluruh pulau",
    seed: 33,
    customerCount: 300,
    productCount: 30,
    ordersPerMonth: 290,
    augustSumateraDrop: true,
  },
] as const;

const COMPANY_PREFIXES = ["PT", "CV", "Toko", "UD", "Warung"] as const;
const COMPANY_NAMES = [
  "Nusantara Digital",
  "Maju Jaya",
  "Sinar Abadi",
  "Berkah Mandiri",
  "Citra Sejahtera",
  "Bumi Lestari",
  "Anugerah Prima",
  "Mitra Dagang",
  "Sumber Rejeki",
  "Indah Makmur",
  "Pangan Sehat",
  "Tekno Rimba",
  "Batik Cantik",
  "Laut Biru",
  "Gunung Mas",
  "Karya Bangsa",
  "Rasa Nusantara",
  "Elektronik Ceria",
  "Rumah Nyaman",
  "Fashion Lokal",
] as const;

const PRODUCT_NAMES: Record<(typeof CATEGORIES)[number], string[]> = {
  Elektronik: [
    "Smartphone Nusantara X1",
    "Earphone Bluetooth Lokal",
    "Powerbank 20.000mAh",
    "Laptop Kantor Pro",
    "Speaker Portable",
    "Charger GaN 65W",
    "Tablet Belajar",
    "Smartwatch Sehat",
  ],
  Fashion: [
    "Batik Modern Pria",
    "Kemeja Linen Wanita",
    "Sneakers Lokal Run",
    "Tas Ransel Kerja",
    "Hijab Premium",
    "Celana Chino",
    "Jaket Parasut",
    "Sandal Kulit",
  ],
  "F&B": [
    "Kopi Gayo 250g",
    "Keripik Singkong",
    "Minyak Goreng 2L",
    "Teh Celup Melati",
    "Sambal Matah Botol",
    "Beras Premium 5kg",
    "Susu UHT Lokal",
    "Snack Tempe Crispy",
  ],
  "Rumah Tangga": [
    "Panci Anti Lengket",
    "Dispenser Galon",
    "Sapu Serbaguna",
    "Set Peralatan Makan",
    "Vacuum Cleaner Mini",
    "Lampu LED Hemat",
    "Wadah Penyimpanan",
    "Kipas Angin Meja",
  ],
};

function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]!;
}

function pad(n: number, width = 4) {
  return String(n).padStart(width, "0");
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${pad(month, 2)}-${pad(day, 2)}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function executiveSpec() {
  return {
    id: "executive-overview",
    title: "Ikhtisar Eksekutif",
    widgets: [
      {
        id: "revenue",
        type: "kpi",
        metric: "revenue",
        comparison: "previous_period",
        title: "Pendapatan",
      },
      {
        id: "revenue-trend",
        type: "line",
        metric: "revenue",
        dimension: "order_date",
        granularity: "month",
        title: "Tren pendapatan",
      },
      {
        id: "region",
        type: "bar",
        metric: "revenue",
        dimension: "region",
        title: "Pendapatan per wilayah",
      },
    ],
  };
}

function resetConnection() {
  try {
    const { resetDbConnection } = require("../src/server/database/client") as {
      resetDbConnection: () => void;
    };
    resetDbConnection();
  } catch {
    /* ignore */
  }
}

function createSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      sector TEXT NOT NULL,
      tagline TEXT NOT NULL
    );
    CREATE TABLE customers (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      segment TEXT NOT NULL,
      region TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );
    CREATE TABLE products (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );
    CREATE TABLE orders (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      order_date TEXT NOT NULL,
      status TEXT NOT NULL,
      net_amount REAL NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
    CREATE TABLE order_items (
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
    CREATE TABLE conversations (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      title TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );
    CREATE TABLE messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      payload_json TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    );
    CREATE TABLE dashboards (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      title TEXT NOT NULL,
      spec_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );
    CREATE TABLE agent_traces (
      id TEXT PRIMARY KEY,
      company_id TEXT,
      conversation_id TEXT,
      message_id TEXT,
      prompt TEXT NOT NULL,
      steps_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );
    CREATE INDEX idx_orders_company_date ON orders(company_id, order_date);
    CREATE INDEX idx_customers_company ON customers(company_id);
  `);
}

function openFreshDb(dbPath: string) {
  resetConnection();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  for (const suffix of ["", "-wal", "-shm"]) {
    const p = `${dbPath}${suffix}`;
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = DELETE");
  createSchema(db);
  return db;
}

function countTables(db: Database.Database) {
  return {
    companies: (db.prepare(`SELECT COUNT(*) AS c FROM companies`).get() as { c: number }).c,
    customers: (db.prepare(`SELECT COUNT(*) AS c FROM customers`).get() as { c: number }).c,
    products: (db.prepare(`SELECT COUNT(*) AS c FROM products`).get() as { c: number }).c,
    orders: (db.prepare(`SELECT COUNT(*) AS c FROM orders`).get() as { c: number }).c,
    order_items: (db.prepare(`SELECT COUNT(*) AS c FROM order_items`).get() as { c: number }).c,
  };
}

function seedDashboards(db: Database.Database, companyIds: string[]) {
  const insertDashboard = db.prepare(
    `INSERT INTO dashboards (id, company_id, title, spec_json, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const now = new Date().toISOString();
  for (const id of companyIds) {
    insertDashboard.run(
      `${id}__executive-overview`,
      id,
      "Ikhtisar Eksekutif",
      JSON.stringify(executiveSpec()),
      now,
      now,
    );
  }
}

function mapCsvRow(
  table: CanonicalTable,
  csvRow: Record<string, string>,
  columns: Record<string, string>,
): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  for (const [csvHeader, sqlCol] of Object.entries(columns)) {
    const raw = csvRow[csvHeader] ?? "";
    if (sqlCol === "price" || sqlCol === "net_amount" || sqlCol === "amount" || sqlCol === "quantity") {
      out[sqlCol] = Number(raw);
    } else {
      out[sqlCol] = raw;
    }
  }
  for (const col of CANONICAL_COLUMNS[table]) {
    if (out[col] === undefined) {
      throw new Error(`Missing mapped column ${col} for ${table}`);
    }
  }
  return out;
}

function samplesAvailable(samplesDir = SAMPLES_DIR) {
  return fs.existsSync(path.join(samplesDir, "companies.csv"));
}

/** Load commerce tables from data/samples CSVs (business-specific columns). */
export function seedDatabaseFromCsv(dbPath = DB_PATH, samplesDir = SAMPLES_DIR) {
  const companiesPath = path.join(samplesDir, "companies.csv");
  if (!fs.existsSync(companiesPath)) {
    throw new Error(`Missing ${companiesPath}`);
  }

  const db = openFreshDb(dbPath);
  const insertCompany = db.prepare(
    `INSERT INTO companies (id, name, slug, sector, tagline) VALUES (?, ?, ?, ?, ?)`,
  );
  const insertCustomer = db.prepare(
    `INSERT INTO customers (id, company_id, name, segment, region, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const insertProduct = db.prepare(
    `INSERT INTO products (id, company_id, name, category, price) VALUES (?, ?, ?, ?, ?)`,
  );
  const insertOrder = db.prepare(
    `INSERT INTO orders (id, company_id, customer_id, order_date, status, net_amount) VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const insertItem = db.prepare(
    `INSERT INTO order_items (id, company_id, order_id, product_id, quantity, amount) VALUES (?, ?, ?, ?, ?, ?)`,
  );

  const companiesParsed = parseCsv(fs.readFileSync(companiesPath, "utf8"));
  const companyIds: string[] = [];

  db.transaction(() => {
    for (const row of companiesParsed.rows) {
      insertCompany.run(row.id, row.name, row.slug, row.sector, row.tagline);
      companyIds.push(row.id!);
    }

    for (const companyId of companyIds) {
      const profile = COMPANY_CSV_PROFILES[companyId];
      if (!profile) {
        throw new Error(`No CSV profile for company ${companyId}`);
      }
      const dir = path.join(samplesDir, companyId);

      const load = (table: CanonicalTable) => {
        const file = profile.files[table];
        const filePath = path.join(dir, file.filename);
        if (!fs.existsSync(filePath)) {
          throw new Error(`Missing sample file ${filePath}`);
        }
        return parseCsv(fs.readFileSync(filePath, "utf8")).rows.map((r) =>
          mapCsvRow(table, r, file.columns),
        );
      };

      for (const row of load("customers")) {
        insertCustomer.run(
          row.id,
          row.company_id,
          row.name,
          row.segment,
          row.region,
          row.created_at,
        );
      }
      for (const row of load("products")) {
        insertProduct.run(row.id, row.company_id, row.name, row.category, row.price);
      }
      for (const row of load("orders")) {
        insertOrder.run(
          row.id,
          row.company_id,
          row.customer_id,
          row.order_date,
          row.status,
          row.net_amount,
        );
      }
      for (const row of load("order_items")) {
        insertItem.run(
          row.id,
          row.company_id,
          row.order_id,
          row.product_id,
          row.quantity,
          row.amount,
        );
      }
    }

    seedDashboards(db, companyIds);
  })();

  const counts = countTables(db);
  db.close();
  return { source: "csv" as const, counts };
}

/** Procedural generator (used when samples are missing, or --generate). */
export function seedDatabaseGenerated(dbPath = DB_PATH) {
  const db = openFreshDb(dbPath);

  const insertCompany = db.prepare(
    `INSERT INTO companies (id, name, slug, sector, tagline) VALUES (?, ?, ?, ?, ?)`,
  );
  const insertCustomer = db.prepare(
    `INSERT INTO customers (id, company_id, name, segment, region, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const insertProduct = db.prepare(
    `INSERT INTO products (id, company_id, name, category, price) VALUES (?, ?, ?, ?, ?)`,
  );
  const insertOrder = db.prepare(
    `INSERT INTO orders (id, company_id, customer_id, order_date, status, net_amount) VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const insertItem = db.prepare(
    `INSERT INTO order_items (id, company_id, order_id, product_id, quantity, amount) VALUES (?, ?, ?, ?, ?, ?)`,
  );

  db.transaction(() => {
    for (const company of SAMPLE_COMPANIES) {
      insertCompany.run(
        company.id,
        company.name,
        company.slug,
        company.sector,
        company.tagline,
      );

      const rng = mulberry32(company.seed);
      const customers: { id: string; region: string }[] = [];
      const products: { id: string; price: number }[] = [];

      for (let i = 1; i <= company.customerCount; i++) {
        const id = `${company.id}_cust_${pad(i)}`;
        const region = pick(rng, REGIONS);
        const segment = pick(rng, SEGMENTS);
        const createdAt = isoDate(2024, 1 + Math.floor(rng() * 12), 1 + Math.floor(rng() * 28));
        const name = `${pick(rng, COMPANY_PREFIXES)} ${pick(rng, COMPANY_NAMES)} ${i}`;
        insertCustomer.run(id, company.id, name, segment, region, createdAt);
        customers.push({ id, region });
      }

      for (let i = 1; i <= company.productCount; i++) {
        const id = `${company.id}_prod_${pad(i)}`;
        const category = pick(rng, CATEGORIES);
        const names = PRODUCT_NAMES[category];
        const name = `${pick(rng, names)} #${i}`;
        const price = Math.round(25_000 + rng() * 4_475_000);
        insertProduct.run(id, company.id, name, category, price);
        products.push({ id, price });
      }

      let orderSeq = 0;
      let itemSeq = 0;
      const months: { year: number; month: number }[] = [];
      for (let m = 0; m < 12; m++) {
        const total = 9 + m;
        const year = total <= 12 ? 2025 : 2026;
        const month = total <= 12 ? total : total - 12;
        months.push({ year, month });
      }

      for (const { year, month } of months) {
        const dim = daysInMonth(year, month);
        const baseOrders = company.ordersPerMonth + Math.floor(rng() * 40) - 20;

        for (let n = 0; n < baseOrders; n++) {
          orderSeq += 1;
          const customer = pick(rng, customers);
          const day = 1 + Math.floor(rng() * dim);
          const orderDate = isoDate(year, month, day);
          const status = pick(rng, STATUSES);

          let volumeMultiplier = 1;
          if (
            company.augustSumateraDrop &&
            year === 2026 &&
            month === 8 &&
            customer.region === "Sumatera"
          ) {
            if (rng() < 0.35) continue;
            volumeMultiplier = 0.72;
          }

          const itemCount = 1 + Math.floor(rng() * 3);
          let netAmount = 0;
          const orderId = `${company.id}_ord_${pad(orderSeq, 5)}`;
          const lineItems: { productId: string; quantity: number; amount: number }[] = [];

          for (let li = 0; li < itemCount; li++) {
            const product = pick(rng, products);
            const quantity = 1 + Math.floor(rng() * 4);
            const amount = Math.round(product.price * quantity * volumeMultiplier);
            netAmount += amount;
            lineItems.push({ productId: product.id, quantity, amount });
          }

          if (status !== "completed") {
            netAmount = Math.round(netAmount * 0.15);
          }

          insertOrder.run(orderId, company.id, customer.id, orderDate, status, netAmount);

          for (const li of lineItems) {
            itemSeq += 1;
            insertItem.run(
              `${company.id}_item_${pad(itemSeq, 5)}`,
              company.id,
              orderId,
              li.productId,
              li.quantity,
              status === "completed" ? li.amount : Math.round(li.amount * 0.15),
            );
          }
        }
      }
    }

    seedDashboards(
      db,
      SAMPLE_COMPANIES.map((c) => c.id),
    );
  })();

  const counts = countTables(db);
  db.close();
  return { source: "generated" as const, counts };
}

export function seedDatabase(
  dbPath = DB_PATH,
  options: { forceGenerate?: boolean; samplesDir?: string } = {},
) {
  const forceGenerate =
    options.forceGenerate ||
    process.argv.includes("--generate") ||
    process.env.SEED_GENERATE === "1";

  if (!forceGenerate && samplesAvailable(options.samplesDir)) {
    return seedDatabaseFromCsv(dbPath, options.samplesDir);
  }
  return seedDatabaseGenerated(dbPath);
}

const isDirect =
  typeof process !== "undefined" &&
  process.argv[1] &&
  process.argv[1].includes("seed");

if (isDirect) {
  const result = seedDatabase();
  console.log(`Database diisi dari ${result.source}:`, result.counts);
  console.log(
    "Perusahaan:",
    SAMPLE_COMPANIES.map((c) => c.name).join(", "),
  );
}
