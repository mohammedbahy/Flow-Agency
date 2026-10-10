import { ROLES } from "./roles.js";

/**
 * Static permission catalogue. This file is the single source of truth for
 * the role -> permission matrix (FLW-173). Roles are fixed; there is no
 * dynamic role editing.
 */
export const PERMISSIONS = Object.freeze({
  USERS_CREATE: "users:create",
  USERS_READ: "users:read",
  USERS_UPDATE: "users:update",
  USERS_DEACTIVATE: "users:deactivate",
  USERS_CHANGE_ROLE: "users:change_role",

  TEAMS_CREATE: "teams:create",
  TEAMS_READ: "teams:read",
  TEAMS_UPDATE: "teams:update",
  TEAMS_DELETE: "teams:delete",
  TEAMS_MANAGE_MEMBERS: "teams:manage_members",

  DEADLINE_RULES_READ: "deadline_rules:read",
  DEADLINE_RULES_MANAGE: "deadline_rules:manage",

  TASKS_CREATE: "tasks:create",
  TASKS_READ: "tasks:read",
  TASKS_UPDATE: "tasks:update",
  TASKS_DELETE: "tasks:delete",

  REPORTS_READ: "reports:read",
});

/**
 * Role -> permissions matrix.
 * - ADMIN: everything (agency owner).
 * - ACCOUNT_MANAGER: read users/teams, create + manage tasks.
 * - EMPLOYEE: read teams, read/update tasks.
 */
export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.ADMIN]: Object.freeze(Object.values(PERMISSIONS)),
  [ROLES.ACCOUNT_MANAGER]: Object.freeze([
    PERMISSIONS.USERS_READ,
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_READ,
    PERMISSIONS.TASKS_UPDATE,
  ]),
  [ROLES.EMPLOYEE]: Object.freeze([
    PERMISSIONS.TEAMS_READ,
    PERMISSIONS.TASKS_READ,
    PERMISSIONS.TASKS_UPDATE,
  ]),
});

export const getPermissionsForRole = (role) =>
  ROLE_PERMISSIONS[role] ? [...ROLE_PERMISSIONS[role]] : [];

export const roleHasPermission = (role, permission) =>
  getPermissionsForRole(role).includes(permission);
