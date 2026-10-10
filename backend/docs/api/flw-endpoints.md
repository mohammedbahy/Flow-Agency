## Flow-Agency Backend — FLW Endpoints

This document captures the key HTTP endpoints introduced/used for FLW-107/108/111/112/164/173/182/226/227. All endpoints return JSON in the project shape `{ success, message?, data?, pagination?, errors? }`. Admin-only operations require the caller to possess the corresponding permission (see `constants/permissions.js`).

### Auth
- `POST /api/v1/auth/login` body `{ email, password }` → 200 `{ data: { token, user: { id, name, email, role, mustChangePassword } } }`. 401/423 on failures. 403 if account deactivated.
- `PATCH /api/v1/auth/change-password` (requires auth) body `{ currentPassword, newPassword }` → 200. Sets `mustChangePassword=false`, bumps `tokenVersion`.

### Permissions (FLW-173)
- `GET /api/v1/permissions/me` (auth) → 200 `{ data: { role, permissions[] } }`.

### Users (FLW-164 + FLW-173)
- `POST /api/v1/users` (admin: `users:create`) body `{ name, email, role(ACCOUNT_MANAGER|EMPLOYEE), password }` → 201 `{ data: user }` (user has `mustChangePassword=true`).
- `GET /api/v1/users` (admin: `users:read`) query `page,limit,search,role,status` → 200 `{ data, pagination }`.
- `GET /api/v1/users/:userId` (admin: `users:read`) → 200 `{ data }`.
- `PATCH /api/v1/users/:userId` (admin: `users:update`) body `{ name?, email? }` → 200 `{ data }`.
- `PATCH /api/v1/users/:userId/status` (admin: `users:deactivate`) body `{ status(active|inactive) }` → 200 `{ data }` (blocks deactivating last admin).
- `PATCH /api/v1/users/:userId/role` (admin: `users:change_role`) body `{ role }` → 200 `{ data }` (blocks demoting last admin; bumps `tokenVersion`).

### Teams (FLW-182)
- `POST /api/v1/teams` (admin: `teams:create`) body `{ name, description? }` → 201.
- `GET /api/v1/teams` (read: `teams:read`) query `page,limit,search,status` → 200 `{ data, pagination }`.
- `GET /api/v1/teams/:teamId` (read: `teams:read`) → 200 `{ data: { members[] ... } }`.
- `PATCH /api/v1/teams/:teamId` (admin: `teams:update`) body `{ name?, description? }` → 200.
- `DELETE /api/v1/teams/:teamId` (admin: `teams:delete`) → 200 (conflict if assigned to clients).
- `POST /api/v1/teams/:teamId/members` (admin: `teams:manage_members`) body `{ userIds[] }` (or `{ userId }`) → 200 `{ data }`.
- `DELETE /api/v1/teams/:teamId/members/:userId` (admin: `teams:manage_members`) → 200 `{ data }`.

### Deadline Rules (FLW-226)
- `GET /api/v1/deadline-rules` (read: `deadline_rules:read`) query `active?, taskType?` → 200 `{ data }`.
- `GET /api/v1/deadline-rules/:ruleId` (read: `deadline_rules:read`) → 200 `{ data }`.
- `POST /api/v1/deadline-rules` (admin: `deadline_rules:manage`) body `{ taskType, offsetValue(number), offsetUnit(days|hours), direction(before|after), active? }` → 201 (one rule per taskType).
- `PATCH /api/v1/deadline-rules/:ruleId` (admin: `deadline_rules:manage`) body partial → 200.
- `DELETE /api/v1/deadline-rules/:ruleId` (admin: `deadline_rules:manage`) → 200.
- Pure: `calculateDeadline(taskType, publishingDate, rules)` (utils/deadline.js) — pure function for unit tests.

### Tasks (FLW-227)
- `POST /api/v1/tasks` (create: `tasks:create`) body `{ taskType, publishingDate?, deadline?, status?, title?, assignee?, client?, team? }`. If `deadline` provided → manual override (`deadlineOverridden=true`). Else auto-computed from active rule.
- `GET /api/v1/tasks` (read: `tasks:read`) query `page,limit,status,taskType,clientId,teamId,assigneeId` → 200 `{ data, pagination }`.
- `GET /api/v1/tasks/:taskId` (read: `tasks:read`) → 200 `{ data }`.
- `PATCH /api/v1/tasks/:taskId` (update: `tasks:update`) body supports `deadline` (null clears/sets manual), `publishingDate`, `taskType`, `recalculateDeadline` (clears override). If not overridden and inputs change → auto-recompute.
- `DELETE /api/v1/tasks/:taskId` (delete: `tasks:delete`, requires `tasks:delete` — only ADMIN) → 200.

### Reports (FLW-107/108/111/112)
- `GET /api/v1/reports/completion-rate` (admin: `reports:read`) query `from?, to?, clientId?, teamId?`. Date range filters `publishingDate`. Returns `{ total, completed, notCompleted, rate(0..1, 4 decimals) }`. (aggregated, no in-memory row loading)
- `GET /api/v1/reports/delayed-tasks` (admin: `reports:read`) query `page,limit,clientId,teamId,assigneeId`. Delayed if `deadline < now` and `status != completed`. Sorted by most delayed (deadline asc). Returns `daysOverdue` (integer days). Populates assignee/client/team names. (indexed: `deadline,status,client,team,assignee,publishingDate,taskType,status+deadline`)

### Notes
- Permission matrix in `constants/permissions.js` (single source of truth).
- User `mustChangePassword` (camelCase in code) set true on admin-created users; cleared on change-password. Login returns it.
- Inactive users cannot login. Deactivating last admin or demoting last admin is blocked.
- Team deletion blocked if assigned to any client.
- Task deadline override is preserved across publishingDate changes unless explicitly recalculated.
