# Database (local Postgres via Docker)

PostgreSQL is the **only** database. It runs in Docker; Prisma (backend)
is the only client. JSON files under `backend/prisma/seed/data/` are
template/seed data, not a database.

Quick start (from repo root):

```bash
cp .env.example .env
docker compose up -d postgres
docker compose ps
docker logs agency-postgres --tail 50
```

Connection string (backend): `DATABASE_URL` — see root `.env.example`.
Port is configurable via `POSTGRES_PORT`.
