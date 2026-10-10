import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getPermissionsForRole,
  roleHasPermission,
  PERMISSIONS,
} from "../constants/permissions.js";
import { ROLES } from "../constants/roles.js";
import { requireRole, requirePermission } from "../middleware/auth.js";
import HttpError from "../utils/http-error.js";

test("getPermissionsForRole returns full set for ADMIN", () => {
  const perms = getPermissionsForRole(ROLES.ADMIN);
  assert.ok(perms.includes(PERMISSIONS.USERS_CREATE));
  assert.ok(perms.includes(PERMISSIONS.REPORTS_READ));
});

test("roleHasPermission works", () => {
  assert.equal(roleHasPermission(ROLES.EMPLOYEE, PERMISSIONS.TASKS_UPDATE), true);
  assert.equal(roleHasPermission(ROLES.EMPLOYEE, PERMISSIONS.REPORTS_READ), false);
});

test("requireRole blocks missing role", () => {
  const next = (err) => {
    assert.ok(err instanceof HttpError);
    assert.equal(err.statusCode, 403);
  };
  requireRole(ROLES.ADMIN)({ user: { role: ROLES.EMPLOYEE } }, {}, next);
});

test("requireRole allows correct role", () => {
  let called = false;
  requireRole(ROLES.ADMIN, ROLES.ACCOUNT_MANAGER)({ user: { role: ROLES.ACCOUNT_MANAGER } }, {}, () => {
    called = true;
  });
  assert.equal(called, true);
});

test("requirePermission requires all permissions", () => {
  let called = false;
  requirePermission(PERMISSIONS.TASKS_READ, PERMISSIONS.TASKS_UPDATE)(
    { user: { role: ROLES.EMPLOYEE } },
    {},
    () => {
      called = true;
    },
  );
  assert.equal(called, true);
});

test("requirePermission forbids when missing", () => {
  requirePermission(PERMISSIONS.REPORTS_READ)(
    { user: { role: ROLES.EMPLOYEE } },
    {},
    (err) => {
      assert.ok(err instanceof HttpError);
      assert.equal(err.statusCode, 403);
    },
  );
});
