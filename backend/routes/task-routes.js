import { Router } from "express";
import { ROLES } from "../constants/roles.js";
import { createTask, listTasks, updateTask } from "../controllers/task-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, requireRole(ROLES.ADMIN, ROLES.ACCOUNT_MANAGER), createTask);
router.get("/", requireAuth, requireRole(ROLES.ADMIN, ROLES.ACCOUNT_MANAGER, ROLES.EMPLOYEE), listTasks);
router.patch(
  "/:taskId",
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.ACCOUNT_MANAGER, ROLES.EMPLOYEE),
  updateTask,
);

export default router;
