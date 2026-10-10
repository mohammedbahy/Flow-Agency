import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  changeUserRole,
  changeUserStatus,
  createUser,
  getUser,
  listUsers,
  updateUser,
} from "../controllers/user-controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.post("/", requirePermission(PERMISSIONS.USERS_CREATE), createUser);
router.get("/", requirePermission(PERMISSIONS.USERS_READ), listUsers);
router.get("/:userId", requirePermission(PERMISSIONS.USERS_READ), getUser);
router.patch("/:userId", requirePermission(PERMISSIONS.USERS_UPDATE), updateUser);
router.patch(
  "/:userId/status",
  requirePermission(PERMISSIONS.USERS_DEACTIVATE),
  changeUserStatus,
);
router.patch(
  "/:userId/role",
  requirePermission(PERMISSIONS.USERS_CHANGE_ROLE),
  changeUserRole,
);

export default router;
