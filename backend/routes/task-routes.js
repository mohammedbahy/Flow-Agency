import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from "../controllers/task-controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", requirePermission(PERMISSIONS.TASKS_READ), listTasks);
router.get("/:taskId", requirePermission(PERMISSIONS.TASKS_READ), getTask);
router.post("/", requirePermission(PERMISSIONS.TASKS_CREATE), createTask);
router.patch("/:taskId", requirePermission(PERMISSIONS.TASKS_UPDATE), updateTask);
router.delete(
  "/:taskId",
  requirePermission(PERMISSIONS.TASKS_DELETE),
  deleteTask,
);

export default router;
