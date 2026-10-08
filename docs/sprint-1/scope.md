# Sprint 1 — Authentication & User Management (planning notes)

Sprint 1 is **not implemented** in this foundation. This note scopes it so
the team can start cleanly.

## Intended scope

- Register / login / logout
- JWT access (+ refresh) tokens
- Password hashing (bcrypt/argon2), password reset flow
- Current-user profile (`GET /api/auth/me` or equivalent)
- User CRUD + role assignment (RBAC enforcement)
- Guards, decorators, Axios auth interceptors, protected routes

## Touch points prepared by Sprint 0

| Area     | Ready for Sprint 1                                  |
| -------- | --------------------------------------------------- |
| DB       | `User`, `Role`, `Permission`, join tables + seed    |
| Backend  | `modules/authentication`, `modules/users` shells    |
| Frontend | `features/authentication/` shells, core API client  |
| Docs     | Security plan (`docs/security/`), API conventions   |

## Suggested task split (4 tracks)

- **Backend**: auth module, JWT strategy, guards, users CRUD, hashing.
- **Frontend**: login/register pages, auth slice + services, interceptors.
- **UI/UX**: auth screens, states (loading/error), accessibility.
- **QA**: auth test plan, e2e (login, RBAC matrix), security checklist.
