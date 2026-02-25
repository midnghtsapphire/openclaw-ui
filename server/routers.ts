import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Agents ──────────────────────────────────────────────────────
  agents: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserAgents(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const agent = await db.getAgentById(input.id);
        if (!agent || agent.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
        return agent;
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        serverIp: z.string().optional(),
        serverPort: z.number().optional(),
        apiKey: z.string().optional(),
        providerType: z.enum(["existing", "digitalocean", "aws", "hetzner"]).default("existing"),
        region: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createAgent({ ...input, userId: ctx.user.id, status: input.providerType === "existing" ? "offline" : "provisioning" });
        await db.createActivityLog({ userId: ctx.user.id, agentId: id!, action: "agent_created", details: `Agent "${input.name}" created via ${input.providerType}` });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        serverIp: z.string().optional(),
        serverPort: z.number().optional(),
        status: z.enum(["online", "offline", "paused"]).optional(),
        isRentable: z.boolean().optional(),
        rentalPricePerHour: z.number().optional(),
        rentalCategory: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const agent = await db.getAgentById(input.id);
        if (!agent || agent.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
        const { id, ...data } = input;
        await db.updateAgent(id, data);
        if (input.status === "paused") {
          await db.createActivityLog({ userId: ctx.user.id, agentId: id, action: "agent_paused", details: "Kill switch activated", severity: "warning" });
        }
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const agent = await db.getAgentById(input.id);
        if (!agent || agent.userId !== ctx.user.id) throw new TRPCError({ code: "NOT_FOUND" });
        await db.deleteAgent(input.id);
        return { success: true };
      }),
  }),

  // ─── Connectors ──────────────────────────────────────────────────
  connectors: router({
    list: protectedProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getAgentConnectors(input.agentId);
      }),

    create: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        type: z.string(),
        name: z.string(),
        config: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createConnector({ ...input, userId: ctx.user.id, config: input.config ?? null });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["active", "inactive"]).optional(),
        config: z.record(z.string(), z.unknown()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateConnector(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.deleteConnector(input.id);
        return { success: true };
      }),
  }),

  // ─── Skills & Scanner ────────────────────────────────────────────
  skills: router({
    list: protectedProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getAgentSkills(input.agentId);
      }),

    upload: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        fileName: z.string(),
        fileUrl: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createSkill({ ...input, userId: ctx.user.id, scanStatus: "pending" });
        return { id };
      }),

    scan: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateSkill(input.id, { scanStatus: "scanning" });
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "You are a security analyst. Analyze the following AI agent skill file for security threats. Check for: malicious code, prompt injection vulnerabilities, data exfiltration attempts, unauthorized API calls, hidden commands, and obfuscated code. Return a JSON object with: riskScore (0-100), threats (array of {type, severity, description}), recommendation (safe/warning/dangerous), summary (string)." },
              { role: "user", content: `Analyze this skill file for security threats. File name: ${input.id}. Provide a comprehensive security assessment.` },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "skill_scan",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    riskScore: { type: "integer", description: "Risk score 0-100" },
                    threats: { type: "array", items: { type: "object", properties: { type: { type: "string" }, severity: { type: "string" }, description: { type: "string" } }, required: ["type", "severity", "description"], additionalProperties: false } },
                    recommendation: { type: "string", description: "safe, warning, or dangerous" },
                    summary: { type: "string" },
                  },
                  required: ["riskScore", "threats", "recommendation", "summary"],
                  additionalProperties: false,
                },
              },
            },
          });
          const rawContent = response.choices[0]?.message?.content;
          const contentStr = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent);
          const report = JSON.parse(contentStr || "{}");
          const scanStatus = report.recommendation === "safe" ? "safe" : report.recommendation === "warning" ? "warning" : "dangerous";
          await db.updateSkill(input.id, { scanStatus, riskScore: report.riskScore, scanReport: report });
          return report;
        } catch {
          await db.updateSkill(input.id, { scanStatus: "error" });
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Scan failed" });
        }
      }),

    install: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateSkill(input.id, { isInstalled: true });
        return { success: true };
      }),
  }),

  // ─── Jobs ────────────────────────────────────────────────────────
  jobs: router({
    list: protectedProcedure
      .input(z.object({ agentId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        if (input.agentId) return db.getAgentJobs(input.agentId);
        return db.getUserJobs(ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createJob({ ...input, userId: ctx.user.id });
        return { id };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["queued", "running", "completed", "failed", "cancelled"]).optional(),
        progress: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, ...data } = input;
        await db.updateJob(id, data);
        return { success: true };
      }),
  }),

  // ─── Chat ────────────────────────────────────────────────────────
  chat: router({
    history: protectedProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ ctx, input }) => {
        const messages = await db.getAgentChatHistory(input.agentId, ctx.user.id);
        return messages.reverse();
      }),

    send: protectedProcedure
      .input(z.object({
        agentId: z.number(),
        message: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createChatMessage({ agentId: input.agentId, userId: ctx.user.id, role: "user", content: input.message });
        const history = await db.getAgentChatHistory(input.agentId, ctx.user.id, 20);
        const messages = history.reverse().map(m => ({ role: m.role as "user" | "assistant" | "system", content: m.content }));
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "You are an OpenClaw AI agent assistant. You help users manage their agents, answer questions about agent operations, and assist with tasks. Be helpful, concise, and professional." },
              ...messages,
            ],
          });
          const rawReply = response.choices[0]?.message?.content;
          const reply = typeof rawReply === 'string' ? rawReply : "I apologize, I could not generate a response.";
          await db.createChatMessage({ agentId: input.agentId, userId: ctx.user.id, role: "assistant", content: reply });
          return { reply };
        } catch {
          const fallback = "I'm currently unable to process your request. Please try again in a moment.";
          await db.createChatMessage({ agentId: input.agentId, userId: ctx.user.id, role: "assistant", content: fallback });
          return { reply: fallback };
        }
      }),
  }),

  // ─── Activity Logs ───────────────────────────────────────────────
  activity: router({
    list: protectedProcedure
      .input(z.object({ agentId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        if (input.agentId) return db.getAgentActivityLogs(input.agentId);
        return db.getUserActivityLogs(ctx.user.id);
      }),
  }),

  // ─── Marketplace ─────────────────────────────────────────────────
  marketplace: router({
    browse: publicProcedure.query(async () => {
      return db.getRentableAgents();
    }),

    rent: protectedProcedure
      .input(z.object({ agentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const agent = await db.getAgentById(input.agentId);
        if (!agent || !agent.isRentable) throw new TRPCError({ code: "NOT_FOUND", message: "Agent not available for rent" });
        const id = await db.createRentalSession({
          agentId: input.agentId,
          renterId: ctx.user.id,
          ownerId: agent.userId,
          hourlyRate: agent.rentalPricePerHour ?? 0,
        });
        return { sessionId: id };
      }),

    myRentals: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserRentals(ctx.user.id);
    }),

    endSession: protectedProcedure
      .input(z.object({ sessionId: z.number(), rating: z.number().min(1).max(5).optional(), review: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await db.updateRentalSession(input.sessionId, { status: "completed", endedAt: new Date(), rating: input.rating, review: input.review });
        return { success: true };
      }),
  }),

  // ─── Billing / Tokens ────────────────────────────────────────────
  billing: router({
    getSubscription: protectedProcedure.query(async ({ ctx }) => {
      return {
        tier: ctx.user.subscriptionTier,
        tokenBalance: ctx.user.tokenBalance,
        stripeCustomerId: ctx.user.stripeCustomerId,
      };
    }),

    tokenHistory: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserTokenHistory(ctx.user.id);
    }),

    purchaseTokens: protectedProcedure
      .input(z.object({ amount: z.number().min(100) }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserTokens(ctx.user.id, input.amount);
        await db.createTokenTransaction({ userId: ctx.user.id, amount: input.amount, type: "purchase", description: `Purchased ${input.amount} tokens` });
        return { success: true, newBalance: (ctx.user.tokenBalance ?? 0) + input.amount };
      }),
  }),
});

export type AppRouter = typeof appRouter;
