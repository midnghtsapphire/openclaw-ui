import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  agents, InsertAgent, Agent,
  connectors, InsertConnector,
  skills, InsertSkill,
  jobs, InsertJob,
  chatMessages, InsertChatMessage,
  activityLogs, InsertActivityLog,
  rentalSessions, InsertRentalSession,
  tokenTransactions, InsertTokenTransaction,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserSubscription(userId: number, tier: "free" | "standard" | "enterprise" | "premium", stripeCustomerId?: string, stripeSubscriptionId?: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ subscriptionTier: tier, stripeCustomerId: stripeCustomerId ?? null, stripeSubscriptionId: stripeSubscriptionId ?? null }).where(eq(users.id, userId));
}

export async function updateUserTokens(userId: number, amount: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ tokenBalance: sql`${users.tokenBalance} + ${amount}` }).where(eq(users.id, userId));
}

// ─── Agents ──────────────────────────────────────────────────────────
export async function createAgent(data: InsertAgent) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(agents).values(data).$returningId();
  return result?.id ?? null;
}

export async function getUserAgents(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agents).where(eq(agents.userId, userId)).orderBy(desc(agents.createdAt));
}

export async function getAgentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
  return result[0];
}

export async function updateAgent(id: number, data: Partial<InsertAgent>) {
  const db = await getDb();
  if (!db) return;
  await db.update(agents).set(data).where(eq(agents.id, id));
}

export async function deleteAgent(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(agents).where(eq(agents.id, id));
}

// ─── Connectors ──────────────────────────────────────────────────────
export async function createConnector(data: InsertConnector) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(connectors).values(data).$returningId();
  return result?.id ?? null;
}

export async function getAgentConnectors(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(connectors).where(eq(connectors.agentId, agentId)).orderBy(desc(connectors.createdAt));
}

export async function updateConnector(id: number, data: Partial<InsertConnector>) {
  const db = await getDb();
  if (!db) return;
  await db.update(connectors).set(data).where(eq(connectors.id, id));
}

export async function deleteConnector(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(connectors).where(eq(connectors.id, id));
}

// ─── Skills ──────────────────────────────────────────────────────────
export async function createSkill(data: InsertSkill) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(skills).values(data).$returningId();
  return result?.id ?? null;
}

export async function getAgentSkills(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(skills).where(eq(skills.agentId, agentId)).orderBy(desc(skills.createdAt));
}

export async function updateSkill(id: number, data: Partial<InsertSkill>) {
  const db = await getDb();
  if (!db) return;
  await db.update(skills).set(data).where(eq(skills.id, id));
}

// ─── Jobs ────────────────────────────────────────────────────────────
export async function createJob(data: InsertJob) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(jobs).values(data).$returningId();
  return result?.id ?? null;
}

export async function getUserJobs(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobs).where(eq(jobs.userId, userId)).orderBy(desc(jobs.createdAt));
}

export async function getAgentJobs(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(jobs).where(eq(jobs.agentId, agentId)).orderBy(desc(jobs.createdAt));
}

export async function updateJob(id: number, data: Partial<InsertJob>) {
  const db = await getDb();
  if (!db) return;
  await db.update(jobs).set(data).where(eq(jobs.id, id));
}

// ─── Chat Messages ───────────────────────────────────────────────────
export async function createChatMessage(data: InsertChatMessage) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(chatMessages).values(data).$returningId();
  return result?.id ?? null;
}

export async function getAgentChatHistory(agentId: number, userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages)
    .where(and(eq(chatMessages.agentId, agentId), eq(chatMessages.userId, userId)))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);
}

// ─── Activity Logs ───────────────────────────────────────────────────
export async function createActivityLog(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(activityLogs).values(data);
}

export async function getAgentActivityLogs(agentId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLogs)
    .where(eq(activityLogs.agentId, agentId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

export async function getUserActivityLogs(userId: number, limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activityLogs)
    .where(eq(activityLogs.userId, userId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}

// ─── Rental Sessions ────────────────────────────────────────────────
export async function createRentalSession(data: InsertRentalSession) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(rentalSessions).values(data).$returningId();
  return result?.id ?? null;
}

export async function getRentableAgents() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agents).where(eq(agents.isRentable, true)).orderBy(desc(agents.createdAt));
}

export async function getUserRentals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rentalSessions).where(eq(rentalSessions.renterId, userId)).orderBy(desc(rentalSessions.createdAt));
}

export async function updateRentalSession(id: number, data: Partial<InsertRentalSession>) {
  const db = await getDb();
  if (!db) return;
  await db.update(rentalSessions).set(data).where(eq(rentalSessions.id, id));
}

// ─── Token Transactions ─────────────────────────────────────────────
export async function createTokenTransaction(data: InsertTokenTransaction) {
  const db = await getDb();
  if (!db) return;
  await db.insert(tokenTransactions).values(data);
}

export async function getUserTokenHistory(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tokenTransactions)
    .where(eq(tokenTransactions.userId, userId))
    .orderBy(desc(tokenTransactions.createdAt))
    .limit(limit);
}
