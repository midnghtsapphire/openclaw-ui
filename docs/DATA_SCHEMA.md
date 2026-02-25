# Data Schema Reference

## Entity Relationship Overview

The OpenClaw platform uses a relational schema with TiDB (MySQL-compatible). All tables use auto-incrementing integer primary keys and UTC timestamps.

## Users Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Surrogate primary key |
| openId | VARCHAR(64) | UNIQUE, NOT NULL | OAuth identifier |
| name | TEXT | | Display name |
| email | VARCHAR(320) | | Email address |
| loginMethod | VARCHAR(64) | | OAuth provider |
| role | ENUM('user','admin') | DEFAULT 'user' | Access level |
| subscriptionTier | ENUM | DEFAULT 'free' | Billing tier |
| tokenBalance | INT | DEFAULT 0 | Current token balance |
| stripeCustomerId | VARCHAR(128) | | Stripe customer reference |
| createdAt | TIMESTAMP | DEFAULT NOW() | Account creation |
| updatedAt | TIMESTAMP | ON UPDATE NOW() | Last modification |
| lastSignedIn | TIMESTAMP | | Last login |

## Agents Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Agent identifier |
| userId | INT | FK → users.id | Owner reference |
| name | VARCHAR(256) | NOT NULL | Agent display name |
| description | TEXT | | Agent description |
| status | ENUM | DEFAULT 'offline' | online, offline, paused, provisioning, error |
| providerType | ENUM | NOT NULL | existing, digitalocean, aws, custom |
| serverIp | VARCHAR(64) | | Server IP address |
| serverPort | INT | | Server port |
| apiKey | VARCHAR(512) | | Encrypted API key |
| framework | VARCHAR(64) | DEFAULT 'openclaw' | Agent framework |
| isRentable | BOOLEAN | DEFAULT false | Marketplace availability |
| rentalPricePerHour | INT | | Price in cents per hour |
| rentalCategory | VARCHAR(128) | | Marketplace category |
| createdAt | TIMESTAMP | DEFAULT NOW() | Registration date |
| updatedAt | TIMESTAMP | ON UPDATE NOW() | Last modification |

## Connectors Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Connector identifier |
| agentId | INT | FK → agents.id | Agent reference |
| type | VARCHAR(64) | NOT NULL | Connector type (openrouter, github, etc.) |
| name | VARCHAR(256) | NOT NULL | Display name |
| status | ENUM | DEFAULT 'inactive' | active, inactive, error |
| config | JSON | | Encrypted configuration |
| lastHealthCheck | TIMESTAMP | | Last health check time |
| createdAt | TIMESTAMP | DEFAULT NOW() | Creation date |
| updatedAt | TIMESTAMP | ON UPDATE NOW() | Last modification |

## Skills Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Skill identifier |
| agentId | INT | FK → agents.id | Agent reference |
| name | VARCHAR(256) | NOT NULL | Skill file name |
| fileName | VARCHAR(512) | | Original file name |
| fileUrl | TEXT | | S3 storage URL |
| scanStatus | ENUM | DEFAULT 'pending' | pending, scanning, safe, warning, dangerous, error |
| riskScore | INT | DEFAULT 0 | 0-100 risk score |
| scanReport | JSON | | Detailed threat analysis |
| isInstalled | BOOLEAN | DEFAULT false | Installation status |
| createdAt | TIMESTAMP | DEFAULT NOW() | Upload date |
| updatedAt | TIMESTAMP | ON UPDATE NOW() | Last modification |

## Jobs, Chat Messages, Activity Logs, Rental Sessions, and Token Transactions

Additional tables follow the same pattern. See `drizzle/schema.ts` for the complete, authoritative schema definition.
