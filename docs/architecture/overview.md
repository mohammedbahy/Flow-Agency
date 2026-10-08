# Architecture

University Software Engineering project — technical foundation (Sprint 0).

## Runtime flow

```text
React (Vite + MUI + Redux Toolkit)
  ↓  HTTPS/JSON, Axios only
REST API (`/api`, NestJS)
  ↓
NestJS modules (authentication, users, roles, permissions, …)
  ↓
Prisma ORM (generated client)
  ↓
PostgreSQL 16 (Docker)
  ↓
Named volume `agency-postgres-data` (persistent dev data)
```

## Dependency direction (frontend)

```text
Pages
  ↓
Components
  ↓
Feature Services / Redux
  ↓
Core API (src/core/api)
  ↓
Backend REST API
```

Rules:

- Components never touch PostgreSQL; only the backend talks to the DB.
- All HTTP goes through `src/core/api/axios.ts` + `api-client.ts`.
- API base URL comes from `VITE_API_BASE_URL` (see `frontend/.env.example`).
- Business logic lives inside its feature folder (`src/features/<domain>/`).
- Reusable UI lives in `src/shared/`; global infra lives in `src/core/`.
- Redux Toolkit holds global state only; local UI state stays local
  (`useState`, component state).

## Backend layout

```text
backend/src/
├── common/      # filters, guards, interceptors, decorators, utils
├── config/      # env-backed configuration
├── database/    # PrismaModule + PrismaService (global)
├── modules/
│   ├── authentication/  # Sprint 1
│   ├── users/           # Sprint 1
│   ├── roles/
│   ├── permissions/
│   ├── clients/         # later sprint
│   ├── brands/          # later sprint
│   └── teams/           # later sprint
├── app.module.ts
└── main.ts              # prefix /api, validation pipe, CORS, Swagger
```

## Team tracks (10 members, 4 tracks)

1. **UI/UX** — MUI theme, layouts, accessibility, page composition.
2. **Frontend** — features, Redux slices, services, routing; integrates with Backend.
3. **Backend** — NestJS modules, Prisma schema/migrations/seed, validation, RBAC.
4. **QA** — test plans, Jest/Vitest suites, e2e, security checklist verification.

No separate Integration team: Frontend + Backend integrate jointly against the
documented REST contract (see `docs/api/`). Security is cross-cutting
(Backend implements, QA verifies — see `docs/security/`). Database work belongs
to Backend.
