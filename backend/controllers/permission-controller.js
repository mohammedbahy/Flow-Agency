import { getPermissionsForRole, ROLE_PERMISSIONS } from "../constants/permissions.js";
import { ROLES } from "../constants/roles.js";

/** FLW-173: returns the role + effective permissions of the caller. */
export const getMyPermissions = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      role: req.user.role,
      permissions: getPermissionsForRole(req.user.role),
    },
  });
};

/** Full role -> permissions matrix (RBAC directory screens). */
export const getPermissionsMatrix = (req, res) => {
  res.status(200).json({
    success: true,
    data: Object.values(ROLES).map((role) => ({
      role,
      permissions: [...(ROLE_PERMISSIONS[role] ?? [])],
    })),
  });
};
