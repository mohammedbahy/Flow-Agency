import { Router } from "express";
import { ROLES } from "../constants/roles.js";
import {
  getAgencySettings,
  updateAgencySettings,
} from "../controllers/agency-settings-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireRole(ROLES.ADMIN), getAgencySettings);
router.patch("/", requireAuth, requireRole(ROLES.ADMIN), updateAgencySettings);

export default router;
