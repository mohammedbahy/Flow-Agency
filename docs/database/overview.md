# Database

- Engine: **PostgreSQL 16** via Docker (`docker-compose.yml`, service `postgres`).
- Access: **Prisma ORM** from the NestJS backend only. React never connects
  to the database.
- Schema source of truth: `backend/prisma/schema.prisma`.
- Migrations: `backend/prisma/migrations/` (committed to Git).
- Dev seed: `backend/prisma/seed/seed.ts` + `backend/prisma/seed/data/*.json`
  (JSON files are template data only — PostgreSQL is the real database).

## Sprint-0 entities

| Model            | Table              | Purpose                              |
| ---------------- | ------------------ | ------------------------------------ |
| `User`           | `users`            | Login identity (Sprint 1 activates)  |
| `Role`           | `roles`            | `admin`, `manager`, `member`         |
| `Permission`     | `permissions`      | Granular keys like `users.read`      |
| `UserRole`       | `user_roles`       | Many-to-many User ↔ Role             |
| `RolePermission` | `role_permissions` | Many-to-many Role ↔ Permission       |

Future entities (`Client`, `Brand`, `Project`, `Task`, `Content`, `Review`,
`Notification`, analytics…) are added incrementally with their features —
never upfront.

## Workflow

```text
Docker PostgreSQL → Prisma Migration → PostgreSQL Schema → Prisma Seed
→ NestJS Backend → React Frontend
```

```bash
# from repo root
docker compose up -d postgres            # 1. start DB
docker compose ps                        #    verify running
docker logs agency-postgres --tail 50    #    logs

# from backend/
npx prisma generate                      # Prisma client
npx prisma migrate dev --name <name>     # dev migration
npx prisma migrate deploy                # prod/CI apply
npm run prisma:seed                      # idempotent dev seed
npx prisma studio                        # visual browser

# reset dev database (DESTROYS data — dev only)
npx prisma migrate reset
# or: docker compose down -v   # also removes the named volume
```

Never auto-destroy the database on startup; resets are explicit operator
actions.
