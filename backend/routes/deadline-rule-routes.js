import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  createDeadlineRule,
  deleteDeadlineRule,
  getDeadlineRule,
  listDeadlineRules,
  updateDeadlineRule,
} from "../controllers/deadline-rule-controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  requirePermission(PERMISSIONS.DEADLINE_RULES_READ),
  listDeadlineRules,
);
router.get(
  "/:ruleId",
  requirePermission(PERMISSIONS.DEADLINE_RULES_READ),
  getDeadlineRule,
);
router.post(
  "/",
  requirePermission(PERMISSIONS.DEADLINE_RULES_MANAGE),
  createDeadlineRule,
);
router.patch(
  "/:ruleId",
  requirePermission(PERMISSIONS.DEADLINE_RULES_MANAGE),
  updateDeadlineRule,
);
router.delete(
  "/:ruleId",
  requirePermission(PERMISSIONS.DEADLINE_RULES_MANAGE),
  deleteDeadlineRule,
);

export default router;
