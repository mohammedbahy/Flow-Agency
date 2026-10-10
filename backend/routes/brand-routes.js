import { Router } from "express";
import { ROLES } from "../constants/roles.js";
import {
  createBrand,
  getBrandMetrics,
  getBrandWorkflow,
  listBrands,
} from "../controllers/brand-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, requireRole(ROLES.ADMIN), createBrand);
router.get("/", requireAuth, requireRole(ROLES.ADMIN, ROLES.ACCOUNT_MANAGER), listBrands);
router.get(
  "/:brandId/workflow",
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.ACCOUNT_MANAGER),
  getBrandWorkflow,
);
router.get(
  "/:brandId/metrics",
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.ACCOUNT_MANAGER),
  getBrandMetrics,
);

export default router;
