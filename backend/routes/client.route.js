import { Router } from "express";
import { ROLES } from "../constants/roles.js";
import {
  createClient,
  getClientById,
  listClients,
  updateClient,
} from "../controllers/client-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import teamAssignmentRoutes from "./team-assignment-routes.js";

const router = Router();

router.post("/", requireAuth, requireRole(ROLES.ADMIN), createClient);
router.get("/", requireAuth, requireRole(ROLES.ADMIN), listClients);
router.get(
  "/:clientId",
  requireAuth,
  requireRole(ROLES.ADMIN, ROLES.ACCOUNT_MANAGER),
  getClientById,
);
router.patch("/:clientId", requireAuth, requireRole(ROLES.ADMIN), updateClient);

router.use("/:clientId/teams", teamAssignmentRoutes);

export default router;
