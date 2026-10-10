import { Router } from "express";
import { ROLES } from "../constants/roles.js";
import { getDashboard } from "../controllers/dashboard-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, requireRole(ROLES.ADMIN), getDashboard);

export default router;
