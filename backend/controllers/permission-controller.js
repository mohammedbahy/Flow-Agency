import { getPermissionsForRole } from "../constants/permissions.js";

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
