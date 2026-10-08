# Security Architecture (planned — Sprint 1+)

Sprint 0 implements only the structural prerequisites (validation pipe,
error envelope, env-based secrets, CORS baseline). Everything below is the
**intended** architecture the team will build toward, not shipped behavior.

## 1. Authentication (Sprint 1)

- Email + password login; registration rules defined by Sprint 1 spec.
- Passwords hashed with bcrypt/argon2 (cost factor documented in code).
  Plaintext passwords never stored, logged, or committed.
- Short-lived access JWT + (Sprint 1 decision) refresh-token rotation.
- `JWT_SECRET` / `JWT_EXPIRES_IN` come from environment only; `.env.example`
  holds placeholders, never real secrets.

## 2. Authorization / RBAC

- Model: `User → Role → Permission` (already in Prisma schema).
- Route protection via NestJS guards (`AuthGuard`, `RolesGuard`) + decorators
  like `@Roles('admin')` / `@Permissions('users.write')`.
- Frontend mirrors permissions for UX only (hide/disable); enforcement is
  always server-side.

## 3. JWT / token security

- Bearer tokens in `Authorization` header; no tokens in URLs or logs.
- Frontend stores tokens per Sprint-1 decision (memory preferred; document
  XSS/CSRF trade-offs); Axios interceptor attaches + refreshes tokens.
- Clock-skew-tolerant expiry validation; explicit logout revocation story.

## 4. Input validation & API protection

- Global `ValidationPipe` (whitelist + forbidNonWhitelisted) on all DTOs.
- Rate limiting / throttling on auth endpoints (Sprint 1).
- CORS allow-list tightened per environment; security headers via Helmet
  (planned).

## 5. Sensitive data handling

- No secrets in Git (`.gitignore` covers `.env*`); code reviews check for leaks.
- Seed data uses `DEV_ONLY_HASH_*` placeholders, not real credentials.
- PII minimized in logs; error responses never leak stack traces or SQL.

## 6. Audit logging

- Auth events (login, failed login, password change) + privileged mutations
  recorded with actor, timestamp, IP, outcome (Sprint 1+ table/feature).
- QA verifies the checklist each sprint (see `docs/sprint-1/`).

Ownership: **Backend implements, QA verifies** — security is cross-cutting,
not a separate team.
