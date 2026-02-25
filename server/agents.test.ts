import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(userId: number = 1): TrpcContext {
  return {
    user: {
      id: userId,
      openId: `user-${userId}`,
      email: `user${userId}@example.com`,
      name: `User ${userId}`,
      loginMethod: "oauth",
      role: "user",
      subscriptionTier: "standard",
      tokenBalance: 50000,
      stripeCustomerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as TrpcContext["res"],
  };
}

describe("Agents Router", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it("should list agents for authenticated user", async () => {
    const caller = appRouter.createCaller(ctx);
    const agents = await caller.agents.list();
    expect(Array.isArray(agents)).toBe(true);
  });

  it("should create a new agent", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.agents.create({
      name: "Test Agent",
      providerType: "existing",
      serverIp: "192.168.1.1",
      serverPort: 3000,
      apiKey: "test-key",
    });
    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should update agent status", async () => {
    const caller = appRouter.createCaller(ctx);
    const created = await caller.agents.create({
      name: "Status Test Agent",
      providerType: "existing",
    });
    const updated = await caller.agents.update({
      id: created.id,
      status: "online",
    });
    expect(updated).toHaveProperty("success");
    expect(updated.success).toBe(true);
  });

  it("should mark agent as rentable", async () => {
    const caller = appRouter.createCaller(ctx);
    const created = await caller.agents.create({
      name: "Rentable Agent",
      providerType: "existing",
    });
    const updated = await caller.agents.update({
      id: created.id,
      isRentable: true,
      rentalPricePerHour: 500,
      rentalCategory: "phone-answering",
    });
    expect(updated).toHaveProperty("success");
    expect(updated.success).toBe(true);
  });
});

describe("Connectors Router", () => {
  let ctx: TrpcContext;
  let agentId: number;

  beforeEach(async () => {
    ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const agent = await caller.agents.create({
      name: "Connector Test Agent",
      providerType: "existing",
    });
    agentId = agent.id;
  });

  it("should list connectors for an agent", async () => {
    const caller = appRouter.createCaller(ctx);
    const connectors = await caller.connectors.list({ agentId });
    expect(Array.isArray(connectors)).toBe(true);
  });

  it("should create a connector", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.connectors.create({
      agentId,
      type: "openrouter",
      name: "OpenRouter Integration",
      config: { apiKey: "test-key" },
    });
    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should update connector status", async () => {
    const caller = appRouter.createCaller(ctx);
    const created = await caller.connectors.create({
      agentId,
      type: "github",
      name: "GitHub Connector",
    });
    const updated = await caller.connectors.update({
      id: created.id,
      status: "active",
    });
    expect(updated).toHaveProperty("success");
    expect(updated.success).toBe(true);
  });
});

describe("Chat Router", () => {
  let ctx: TrpcContext;
  let agentId: number;

  beforeEach(async () => {
    ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const agent = await caller.agents.create({
      name: "Chat Test Agent",
      providerType: "existing",
    });
    agentId = agent.id;
  });

  it("should retrieve chat history", async () => {
    const caller = appRouter.createCaller(ctx);
    const history = await caller.chat.history({ agentId });
    expect(Array.isArray(history)).toBe(true);
  });

  it("should send a message and get response", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.chat.send({
      agentId,
      message: "Hello, agent!",
    });
    expect(result).toHaveProperty("reply");
    expect(typeof result.reply).toBe("string");
  });
});

describe("Jobs Router", () => {
  let ctx: TrpcContext;
  let agentId: number;

  beforeEach(async () => {
    ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);
    const agent = await caller.agents.create({
      name: "Job Test Agent",
      providerType: "existing",
    });
    agentId = agent.id;
  });

  it("should list jobs for an agent", async () => {
    const caller = appRouter.createCaller(ctx);
    const jobs = await caller.jobs.list({ agentId });
    expect(Array.isArray(jobs)).toBe(true);
  });

  it("should create a job", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.jobs.create({
      agentId,
      title: "Test Job",
      description: "A test job",
      priority: "high",
    });
    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should update job status", async () => {
    const caller = appRouter.createCaller(ctx);
    const created = await caller.jobs.create({
      agentId,
      title: "Status Update Job",
      priority: "medium",
    });
    const updated = await caller.jobs.update({
      id: created.id,
      status: "running",
      progress: 50,
    });
    expect(updated).toHaveProperty("success");
    expect(updated.success).toBe(true);
  });
});

describe("Marketplace Router", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it("should browse rentable agents", async () => {
    const caller = appRouter.createCaller(ctx);
    const listings = await caller.marketplace.browse();
    expect(Array.isArray(listings)).toBe(true);
  });

  it("should rent an agent", async () => {
    const caller = appRouter.createCaller(ctx);
    // First create a rentable agent
    const agent = await caller.agents.create({
      name: "Rentable Test Agent",
      providerType: "existing",
    });
    await caller.agents.update({
      id: agent.id,
      isRentable: true,
      rentalPricePerHour: 1000,
    });
    // Then rent it
    const rental = await caller.marketplace.rent({ agentId: agent.id });
    expect(rental).toHaveProperty("sessionId");
  });

  it("should list user rentals", async () => {
    const caller = appRouter.createCaller(ctx);
    const rentals = await caller.marketplace.myRentals();
    expect(Array.isArray(rentals)).toBe(true);
  });
});

describe("Billing Router", () => {
  let ctx: TrpcContext;

  beforeEach(() => {
    ctx = createMockContext();
  });

  it("should get subscription info", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.billing.getSubscription();
    expect(result).toHaveProperty("tier");
    expect(result).toHaveProperty("tokenBalance");
  });

  it("should retrieve token history", async () => {
    const caller = appRouter.createCaller(ctx);
    const history = await caller.billing.tokenHistory();
    expect(Array.isArray(history)).toBe(true);
  });
});
