# API Reference

All API endpoints are accessed via tRPC at `/api/trpc`. Authentication is handled via OAuth session cookies.

## Authentication

| Procedure | Type | Auth | Description |
|-----------|------|------|-------------|
| `auth.me` | Query | Public | Returns current authenticated user or null |
| `auth.logout` | Mutation | Public | Clears session cookie, returns `{ success: true }` |

## Agents

| Procedure | Type | Auth | Input | Description |
|-----------|------|------|-------|-------------|
| `agents.list` | Query | Protected | — | List all agents owned by current user |
| `agents.create` | Mutation | Protected | `{ name, providerType, description?, serverIp?, serverPort?, apiKey? }` | Register a new agent |
| `agents.update` | Mutation | Protected | `{ id, status?, name?, description?, isRentable?, rentalPricePerHour?, rentalCategory? }` | Update agent properties |
| `agents.delete` | Mutation | Protected | `{ id }` | Delete an agent |

## Connectors

| Procedure | Type | Auth | Input | Description |
|-----------|------|------|-------|-------------|
| `connectors.list` | Query | Protected | `{ agentId }` | List connectors for an agent |
| `connectors.create` | Mutation | Protected | `{ agentId, type, name, config? }` | Add a connector |
| `connectors.update` | Mutation | Protected | `{ id, status?, config? }` | Update connector |
| `connectors.delete` | Mutation | Protected | `{ id }` | Remove connector |

## Skills (Malicious Skill Scanner)

| Procedure | Type | Auth | Input | Description |
|-----------|------|------|-------|-------------|
| `skills.list` | Query | Protected | `{ agentId }` | List skills for an agent |
| `skills.upload` | Mutation | Protected | `{ agentId, name, fileName?, fileUrl? }` | Upload a skill file |
| `skills.scan` | Mutation | Protected | `{ skillId }` | Trigger AI security scan |
| `skills.install` | Mutation | Protected | `{ skillId }` | Install a scanned-safe skill |

## Chat

| Procedure | Type | Auth | Input | Description |
|-----------|------|------|-------|-------------|
| `chat.history` | Query | Protected | `{ agentId }` | Get conversation history |
| `chat.send` | Mutation | Protected | `{ agentId, message }` | Send message, get AI response |

## Activity Logs

| Procedure | Type | Auth | Input | Description |
|-----------|------|------|-------|-------------|
| `activity.list` | Query | Protected | `{ agentId? }` | Get activity logs |

## Jobs

| Procedure | Type | Auth | Input | Description |
|-----------|------|------|-------|-------------|
| `jobs.list` | Query | Protected | `{ agentId }` | List jobs for an agent |
| `jobs.create` | Mutation | Protected | `{ agentId, title, description?, priority? }` | Create a new job |
| `jobs.update` | Mutation | Protected | `{ id, status?, progress?, result? }` | Update job status |

## Marketplace

| Procedure | Type | Auth | Input | Description |
|-----------|------|------|-------|-------------|
| `marketplace.browse` | Query | Public | — | List all rentable agents |
| `marketplace.rent` | Mutation | Protected | `{ agentId }` | Start a rental session |
| `marketplace.myRentals` | Query | Protected | — | List user's rental sessions |
| `marketplace.endSession` | Mutation | Protected | `{ sessionId, rating?, review? }` | End a rental session |

## Billing

| Procedure | Type | Auth | Input | Description |
|-----------|------|------|-------|-------------|
| `billing.getSubscription` | Query | Protected | — | Get current plan and token balance |
| `billing.tokenHistory` | Query | Protected | — | Get token transaction history |
