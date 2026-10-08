# Agency Management System — Backend (NestJS)

NestJS REST API. Technical foundation only (Sprint 0).

## Prerequisites

- Node.js 20+ and npm
- Docker + Docker Compose (for PostgreSQL)
- Root `.env` file (see `/ .env.example`)

## Setup

```bash
# 1. Start PostgreSQL (from repo root)
docker compose up -d postgres

# 2. Install dependencies (from backend/)
npm install

# 3. Configure environment
cp .env.example .env

# 4. Prisma: generate client + migrate + seed
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed

# 5. Start API in watch mode
npm run start:dev
```

- API base: `http://localhost:3000/api`
- Health: `GET http://localhost:3000/api/health`
- Swagger: `http://localhost:3000/api/docs`

## Scripts

| Command                    | Description                          |
| -------------------------- | ------------------------------------ |
| `npm run start:dev`        | Start API with hot reload            |
| `npm run build`            | Production build (`dist/`)           |
| `npm run start:prod`       | Run compiled build                   |
| `npm test`                 | Unit tests (Jest)                    |
| `npm run test:e2e`         | End-to-end tests                     |
| `npm run lint:check`       | ESLint check                         |
| `npx prisma studio`        | Visual DB browser                    |
| `npm run prisma:seed`      | Idempotent dev seed from JSON files  |

## Structure

```text
src/
├── common/      # cross-cutting filters, guards, interceptors, utils…
├── config/      # environment validation
├── database/    # PrismaService
├── modules/     # authentication, users, roles, permissions, clients, brands, teams
├── app.module.ts
└── main.ts
prisma/
├── schema.prisma
├── migrations/
└── seed/        # seed.ts + data/*.json (dev-only template data)
```
