# Agency Management System

University **Software Engineering** project — technical foundation (Sprint 0).

> No business features are implemented at this stage. This repo establishes
> the architecture, monorepo layout, Docker + PostgreSQL + Prisma foundation,
> NestJS + React shells, documentation, and Git setup so the team can build
> **Sprint 1 (Authentication & User Management)** next.

## Technology stack

| Layer        | Choice                                                        |
| ------------ | ------------------------------------------------------------- |
| Frontend     | React, TypeScript, Vite, React Router, Redux Toolkit, Axios, MUI |
| Backend      | NestJS, TypeScript, REST API (`/api`), Swagger (`/api/docs`)  |
| Database     | PostgreSQL 16 (Docker) + Prisma ORM                           |
| Infra        | Docker, Docker Compose                                        |
| Repo         | Single Git monorepo, GitHub-ready                             |

## Architecture

```text
React
  ↓  REST (Axios → /api)
NestJS
  ↓
Prisma
  ↓
PostgreSQL
  ↓
Docker
```

Details: `docs/architecture/overview.md` · API: `docs/api/overview.md` ·
DB: `docs/database/overview.md` · Security plan: `docs/security/overview.md` ·
Sprint 1 scope: `docs/sprint-1/scope.md`.

## Repository structure

```text
agency-management-system/
├── frontend/        # Vite React TS app (app/core/features/shared)
├── backend/         # NestJS API + Prisma schema/migrations/seed
├── database/        # DB notes (Postgres runs in Docker)
├── docs/            # architecture, api, database, security, sprint-1
├── docker/postgres/ # Postgres notes (config in docker-compose.yml)
├── docker-compose.yml
├── .env.example
└── README.md
```

## Prerequisites

- Node.js 20+ and npm
- Docker + Docker Compose
- Git

## 1. Environment

```bash
cp .env.example .env                 # root (Postgres + shared settings)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Key variables (see `.env.example`): `POSTGRES_DB / POSTGRES_USER /
POSTGRES_PASSWORD / POSTGRES_PORT`, `DATABASE_URL`, `BACKEND_PORT`,
`VITE_API_BASE_URL`, `JWT_SECRET / JWT_EXPIRES_IN` (dev placeholders only).

## 2. Docker setup (PostgreSQL)

```bash
docker compose up -d postgres   # start
docker compose ps               # verify running
docker logs agency-postgres --tail 50   # logs
docker compose stop postgres    # stop (keeps data)
docker compose down             # stop + remove containers (keeps volume)
docker compose down -v          # DANGER: also deletes DB data
```

Healthcheck: `pg_isready` (see `docker-compose.yml`); port via `POSTGRES_PORT`.

## 3. Database setup (Prisma)

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init   # creates & applies migration
npm run prisma:seed                  # idempotent JSON → Postgres seed
npx prisma studio                    # optional visual browser
```

Reset dev DB (destroys data): `npx prisma migrate reset`.

## 4. Backend setup (NestJS)

```bash
cd backend
npm install
npm run start:dev
```

- API: `http://localhost:3000/api`
- Health: `GET http://localhost:3000/api/health`
- Swagger: `http://localhost:3000/api/docs`

## 5. Frontend setup (React)

```bash
cd frontend
npm install
npm run dev
```

- App: `http://localhost:5173` (shows “Agency Management System” shell)

## Prisma commands

| Command                         | Purpose                          |
| ------------------------------- | -------------------------------- |
| `npx prisma generate`           | Generate Prisma client           |
| `npx prisma migrate dev`        | Create + apply dev migration     |
| `npx prisma migrate deploy`     | Apply migrations (prod/CI)       |
| `npm run prisma:seed`           | Idempotent dev seed              |
| `npx prisma studio`             | DB browser                       |
| `npx prisma migrate reset`      | Reset dev DB (destroys data)     |

## Seed commands

```bash
cd backend
npm run prisma:seed   # reads prisma/seed/data/*.json, upserts via Prisma
```

JSON files are template data only; PostgreSQL is the real database.

## Testing commands

```bash
cd backend
npm test              # unit tests (Jest)
npm run test:e2e       # e2e (needs DB? health-only test uses app module)
npm run lint:check    # ESLint
npm run build         # production build

cd ../frontend
npm test              # Vitest run
npm run build         # tsc + vite build (runs type-check)
```

## Development workflow

```text
Docker PostgreSQL → Prisma Migration → PostgreSQL Schema → Prisma Seed
→ NestJS Backend → React Frontend
```

1. `docker compose up -d postgres`
2. `cd backend && npx prisma migrate dev && npm run prisma:seed`
3. `npm run start:dev` (backend)
4. `cd ../frontend && npm run dev` (frontend)

## Team responsibilities (10 members, 4 tracks)

- **UI/UX** — theme, layouts, accessibility.
- **Frontend** — features + Redux + API integration.
- **Backend** — NestJS modules + Prisma + validation + RBAC.
- **QA** — test plans, Jest/Vitest, e2e, security checklist.

No separate Integration team (Frontend + Backend integrate jointly).
Security is cross-cutting (Backend implements, QA verifies). Database work
belongs to Backend.

## License

MIT — see [LICENSE](LICENSE).
