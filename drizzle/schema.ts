import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, json, bigint } from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  subscriptionTier: mysqlEnum("subscriptionTier", ["free", "standard", "enterprise", "premium"]).default("free").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  tokenBalance: int("tokenBalance").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Agents ──────────────────────────────────────────────────────────
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["online", "offline", "provisioning", "error", "paused"]).default("offline").notNull(),
  serverIp: varchar("serverIp", { length: 64 }),
  serverPort: int("serverPort"),
  apiKey: varchar("apiKey", { length: 512 }),
  providerType: mysqlEnum("providerType", ["existing", "digitalocean", "aws", "hetzner"]).default("existing").notNull(),
  providerInstanceId: varchar("providerInstanceId", { length: 128 }),
  region: varchar("region", { length: 64 }),
  isRentable: boolean("isRentable").default(false).notNull(),
  rentalPricePerHour: int("rentalPricePerHour"),
  rentalCategory: varchar("rentalCategory", { length: 128 }),
  healthScore: int("healthScore").default(100),
  lastHealthCheck: timestamp("lastHealthCheck"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// ─── Connectors ──────────────────────────────────────────────────────
export const connectors = mysqlTable("connectors", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "inactive", "error"]).default("inactive").notNull(),
  config: json("config"),
  lastHealthCheck: timestamp("lastHealthCheck"),
  apiCallCount: int("apiCallCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Connector = typeof connectors.$inferSelect;
export type InsertConnector = typeof connectors.$inferInsert;

// ─── Skills ──────────────────────────────────────────────────────────
export const skills = mysqlTable("skills", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  fileName: varchar("fileName", { length: 512 }),
  fileUrl: varchar("fileUrl", { length: 1024 }),
  scanStatus: mysqlEnum("scanStatus", ["pending", "scanning", "safe", "warning", "dangerous", "error"]).default("pending").notNull(),
  riskScore: int("riskScore"),
  scanReport: json("scanReport"),
  isInstalled: boolean("isInstalled").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;

// ─── Jobs ────────────────────────────────────────────────────────────
export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["queued", "running", "completed", "failed", "cancelled"]).default("queued").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  progress: int("progress").default(0).notNull(),
  result: json("result"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

// ─── Chat Messages ───────────────────────────────────────────────────
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ─── Activity Logs ───────────────────────────────────────────────────
export const activityLogs = mysqlTable("activityLogs", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId"),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  details: text("details"),
  severity: mysqlEnum("severity", ["info", "warning", "error", "critical"]).default("info").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// ─── Rental Sessions ────────────────────────────────────────────────
export const rentalSessions = mysqlTable("rentalSessions", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull(),
  renterId: int("renterId").notNull(),
  ownerId: int("ownerId").notNull(),
  status: mysqlEnum("status", ["active", "completed", "cancelled"]).default("active").notNull(),
  hourlyRate: int("hourlyRate").notNull(),
  totalHours: int("totalHours").default(0),
  totalCost: int("totalCost").default(0),
  rating: int("rating"),
  review: text("review"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  endedAt: timestamp("endedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RentalSession = typeof rentalSessions.$inferSelect;
export type InsertRentalSession = typeof rentalSessions.$inferInsert;

// ─── Token Transactions ─────────────────────────────────────────────
export const tokenTransactions = mysqlTable("tokenTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: int("amount").notNull(),
  type: mysqlEnum("type", ["purchase", "usage", "refund", "bonus"]).notNull(),
  description: varchar("description", { length: 512 }),
  stripePaymentId: varchar("stripePaymentId", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TokenTransaction = typeof tokenTransactions.$inferSelect;
export type InsertTokenTransaction = typeof tokenTransactions.$inferInsert;
