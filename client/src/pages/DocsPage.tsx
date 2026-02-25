import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Map, Database, Code, Shield, ListTodo } from "lucide-react";
import { Streamdown } from "streamdown";

const blueprintMd = `# OpenClaw Agent Management Platform — Blueprint

## Vision
OpenClaw is the professional management layer for autonomous AI agents. It provides enterprise-grade provisioning, monitoring, security scanning, and marketplace capabilities for the OpenClaw agent framework.

## Architecture
- **Frontend:** React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend:** Express 4 + tRPC 11 + Drizzle ORM
- **Database:** TiDB (MySQL-compatible)
- **Auth:** OAuth 2.0 via platform provider
- **Payments:** Stripe (subscriptions + one-time token packs)
- **AI:** Built-in LLM integration for chat and skill scanning

## Core Modules
1. **Agent Registration** — Connect existing agents or one-click provision new ones
2. **Connector Marketplace** — 12+ pre-built API integrations
3. **Chat Interface** — Real-time conversation with agents
4. **Malicious Skill Scanner** — AI-powered security analysis (Industry First)
5. **Behavior Monitoring** — Real-time activity feed with kill switch
6. **Job Queue** — Task assignment and progress tracking
7. **Agent Rental Marketplace** — Rent pre-configured agents by the hour
8. **Billing & Tokens** — Subscription tiers + token credit system
`;

const roadmapMd = `# Product Roadmap

## MVP (Current)
- [x] User authentication (OAuth)
- [x] Agent registration (existing + one-click)
- [x] Connector marketplace (12 integrations)
- [x] Chat interface with LLM
- [x] Malicious skill scanner
- [x] Behavior monitoring + kill switch
- [x] Job queue management
- [x] Agent rental marketplace
- [x] Billing with subscription tiers
- [x] Token credit system
- [x] Glassmorphism UI with accessibility modes

## v1.0 (Q2 2026)
- [ ] Stripe checkout integration (live payments)
- [ ] DigitalOcean API provisioning (live droplet creation)
- [ ] Multi-model research team (parallel LLM queries)
- [ ] Webhook system for external integrations
- [ ] Mobile-responsive PWA
- [ ] Email notifications

## v2.0 (Q3 2026)
- [ ] Extreme Programming Mode (10 parallel workers)
- [ ] Sub-agent spawning
- [ ] Voice interface (ElevenLabs)
- [ ] Patent & IP tracker module
- [ ] White-label marketplace
- [ ] Enterprise SSO (SAML/OIDC)
`;

const schemaMd = `# Data Schema

## Users
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| openId | VARCHAR(64) | OAuth identifier |
| name | TEXT | Display name |
| email | VARCHAR(320) | Email address |
| role | ENUM | user, admin |
| subscriptionTier | ENUM | free, standard, enterprise, premium |
| tokenBalance | INT | Current token balance |
| stripeCustomerId | VARCHAR(128) | Stripe customer ID |

## Agents
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| userId | INT (FK) | Owner reference |
| name | VARCHAR(256) | Agent name |
| status | ENUM | online, offline, paused, provisioning, error |
| providerType | ENUM | existing, digitalocean, aws, custom |
| serverIp | VARCHAR(64) | Server IP address |
| isRentable | BOOLEAN | Available for marketplace |
| rentalPricePerHour | INT | Price in cents |

## Connectors
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| agentId | INT (FK) | Agent reference |
| type | VARCHAR(64) | Connector type ID |
| status | ENUM | active, inactive, error |
| config | JSON | Encrypted configuration |

## Skills
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| agentId | INT (FK) | Agent reference |
| scanStatus | ENUM | pending, scanning, safe, warning, dangerous, error |
| riskScore | INT | 0-100 risk score |
| scanReport | JSON | Detailed threat analysis |

## Jobs
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| agentId | INT (FK) | Agent reference |
| status | ENUM | queued, running, completed, failed, cancelled |
| priority | ENUM | low, medium, high, critical |
| progress | INT | 0-100 percentage |

## Rental Sessions
| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK) | Auto-increment |
| agentId | INT (FK) | Agent being rented |
| renterId | INT (FK) | User renting |
| ownerId | INT (FK) | Agent owner |
| hourlyRate | INT | Rate in cents |
| status | ENUM | active, completed, cancelled, disputed |
`;

const apiDocsMd = `# API Reference

All API endpoints are accessed via tRPC at \`/api/trpc\`.

## Authentication
- \`auth.me\` — GET current user
- \`auth.logout\` — POST logout

## Agents
- \`agents.list\` — GET all user agents
- \`agents.create\` — POST create/register agent
- \`agents.update\` — PATCH update agent status
- \`agents.delete\` — DELETE remove agent

## Connectors
- \`connectors.list\` — GET agent connectors
- \`connectors.create\` — POST add connector
- \`connectors.update\` — PATCH update connector
- \`connectors.delete\` — DELETE remove connector

## Skills
- \`skills.list\` — GET agent skills
- \`skills.upload\` — POST upload skill file
- \`skills.scan\` — POST trigger security scan
- \`skills.install\` — POST install safe skill

## Chat
- \`chat.history\` — GET conversation history
- \`chat.send\` — POST send message to agent

## Jobs
- \`jobs.list\` — GET agent jobs
- \`jobs.create\` — POST create new job
- \`jobs.update\` — PATCH update job status

## Marketplace
- \`marketplace.browse\` — GET rentable agents
- \`marketplace.rent\` — POST start rental session
- \`marketplace.myRentals\` — GET user rentals
- \`marketplace.endSession\` — POST end rental

## Billing
- \`billing.getSubscription\` — GET current plan
- \`billing.tokenHistory\` — GET token transactions
`;

const patentMd = `# Patent Disclosure Opportunities

## 1. Malicious Skill Scanner for AI Agents
**Title:** System and Method for Automated Security Analysis of AI Agent Skill Files
**Abstract:** A system that performs multi-vector security analysis on skill files intended for installation on autonomous AI agents, including detection of prompt injection, data exfiltration patterns, unauthorized API calls, hidden commands, and obfuscated code, producing a quantified risk score and detailed threat report.
**Novel Claims:**
- AI-powered static analysis specifically designed for agent skill files
- Risk scoring algorithm combining multiple threat vectors
- Pre-installation quarantine and approval workflow

## 2. Agent Rental Marketplace
**Title:** Platform for Hourly Rental of Pre-Configured Autonomous AI Agents
**Abstract:** A marketplace system enabling businesses to rent pre-configured AI agents on an hourly basis, analogous to temporary staffing agencies but for AI agents, with integrated billing, session management, and quality rating systems.
**Novel Claims:**
- Time-based billing model for AI agent access
- Sandboxed execution environment for rental sessions
- Dual-sided marketplace with commission structure

## 3. Real-Time Agent Behavior Monitoring
**Title:** System for Real-Time Behavioral Analysis and Emergency Control of Autonomous AI Agents
**Abstract:** A monitoring system that tracks autonomous AI agent behavior in real-time, detecting hallucinations, erratic behavior patterns, and unauthorized actions, with an emergency kill switch for immediate agent termination.
**Novel Claims:**
- Hallucination detection algorithm for agent outputs
- Multi-severity alert classification system
- One-click emergency stop mechanism with state preservation

## 4. One-Click Agent Provisioning
**Title:** Automated Cloud Provisioning System for Autonomous AI Agents
**Abstract:** A system that enables single-click deployment of fully configured autonomous AI agents on cloud infrastructure, including automated server provisioning, dependency installation, configuration, and health verification.

---
*Prepared for: GlowStarLabs / Audrey Evans Official*
*Date: February 2026*
*Status: Disclosure — Not Yet Filed*
`;

const kanbanMd = `# Development Kanban

## Done
- User authentication system
- Agent registration (connect existing)
- Agent registration (one-click create UI)
- Connector marketplace (12 integrations)
- Chat interface with LLM backend
- Malicious skill scanner with AI analysis
- Behavior monitoring dashboard
- Kill switch / emergency controls
- Job queue management
- Agent rental marketplace
- Billing page with subscription tiers
- Token credit system UI
- Glassmorphism design system
- Documentation portal
- Accessibility modes

## In Progress
- Stripe live checkout integration
- DigitalOcean API provisioning

## Backlog
- Multi-model research team
- Voice interface
- Mobile PWA
- Email notifications
- Enterprise SSO
- White-label marketplace
- Sub-agent spawning
- Patent filing preparation
`;

const tabs = [
  { id: "blueprint", label: "Blueprint", icon: FileText, content: blueprintMd },
  { id: "roadmap", label: "Roadmap", icon: Map, content: roadmapMd },
  { id: "schema", label: "Data Schema", icon: Database, content: schemaMd },
  { id: "api", label: "API Docs", icon: Code, content: apiDocsMd },
  { id: "patent", label: "Patent Disclosure", icon: Shield, content: patentMd },
  { id: "kanban", label: "Kanban", icon: ListTodo, content: kanbanMd },
];

export default function DocsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documentation</h1>
          <p className="text-muted-foreground mt-1">Blueprint, roadmap, schemas, API reference, and more.</p>
        </div>

        <Tabs defaultValue="blueprint" className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto">
            {tabs.map(t => (
              <TabsTrigger key={t.id} value={t.id} className="gap-1.5">
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map(t => (
            <TabsContent key={t.id} value={t.id}>
              <div className="glass-card rounded-xl p-6 md:p-8 prose prose-invert max-w-none">
                <Streamdown>{t.content}</Streamdown>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
