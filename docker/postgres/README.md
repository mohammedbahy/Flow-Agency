# Postgres (Docker)

Configuration lives in the root `docker-compose.yml`:

- Image: `postgres:16-alpine`
- Named volume: `agency-postgres-data` (persistent dev data)
- Env: `POSTGRES_DB / POSTGRES_USER / POSTGRES_PASSWORD` (from root `.env`)
- Port: `${POSTGRES_PORT:-5432}:5432`
- Healthcheck: `pg_isready -U $POSTGRES_USER -d $POSTGRES_DB`

No init-SQL scripts are needed for Sprint 0 — Prisma migrations own the
schema. Mount custom scripts here only if a future sprint requires them.
