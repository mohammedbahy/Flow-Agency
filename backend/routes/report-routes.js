import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  getCompletionRate,
  getDelayedTasks,
} from "../controllers/report-controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requirePermission(PERMISSIONS.REPORTS_READ));

router.get("/completion-rate", getCompletionRate);
router.get("/delayed-tasks", getDelayedTasks);

export default router;
