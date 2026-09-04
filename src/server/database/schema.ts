import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  sector: text("sector").notNull(),
  tagline: text("tagline").notNull(),
});

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  name: text("name").notNull(),
  segment: text("segment").notNull(),
  region: text("region").notNull(),
  createdAt: text("created_at").notNull(),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: real("price").notNull(),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id),
  orderDate: text("order_date").notNull(),
  status: text("status").notNull(),
  netAmount: real("net_amount").notNull(),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  quantity: integer("quantity").notNull(),
  amount: real("amount").notNull(),
});

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  title: text("title").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id),
  role: text("role").notNull(),
  content: text("content").notNull(),
  payloadJson: text("payload_json"),
  createdAt: text("created_at").notNull(),
});

export const dashboards = sqliteTable("dashboards", {
  id: text("id").primaryKey(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id),
  title: text("title").notNull(),
  specJson: text("spec_json").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const agentTraces = sqliteTable("agent_traces", {
  id: text("id").primaryKey(),
  companyId: text("company_id").references(() => companies.id),
  conversationId: text("conversation_id"),
  messageId: text("message_id"),
  prompt: text("prompt").notNull(),
  stepsJson: text("steps_json").notNull(),
  createdAt: text("created_at").notNull(),
});

export const companiesRelations = relations(companies, ({ many }) => ({
  customers: many(customers),
  products: many(products),
  orders: many(orders),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  company: one(companies, {
    fields: [customers.companyId],
    references: [companies.id],
  }),
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  company: one(companies, {
    fields: [orders.companyId],
    references: [companies.id],
  }),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  company: one(companies, {
    fields: [products.companyId],
    references: [companies.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
