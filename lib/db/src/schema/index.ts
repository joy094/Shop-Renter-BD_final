import { pgTable, text, timestamp, integer, numeric, date, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: varchar("role", { length: 32 }).notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tenantsTable = pgTable("tenants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  nidNumber: varchar("nid_number", { length: 64 }),
  address: text("address"),
  email: text("email"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const shopsTable = pgTable("shops", {
  id: text("id").primaryKey(),
  code: varchar("code", { length: 64 }).notNull(),
  location: text("location").notNull(),
  sizeSqft: numeric("size_sqft"),
  monthlyRent: numeric("monthly_rent").notNull(),
  depositAmount: numeric("deposit_amount"),
  tenantId: text("tenant_id"),
  leaseStart: date("lease_start"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const paymentsTable = pgTable("payments", {
  id: text("id").primaryKey(),
  shopId: text("shop_id").notNull(),
  tenantId: text("tenant_id").notNull(),
  month: varchar("month", { length: 7 }).notNull(),
  amountDue: numeric("amount_due").notNull(),
  amountPaid: numeric("amount_paid").notNull().default("0"),
  paidOn: date("paid_on"),
  method: varchar("method", { length: 32 }),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
