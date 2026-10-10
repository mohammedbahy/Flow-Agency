import { Router } from "express";
import { ROLES } from "../constants/roles.js";
import {
  assignTeamToClient,
  listClientTeams,
  removeTeamAssignment,
} from "../controllers/team-assignment-controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

router.use(requireAuth, requireRole(ROLES.ADMIN));

router.post("/", assignTeamToClient);
router.get("/", listClientTeams);
router.delete("/:teamId", removeTeamAssignment);

export default router;
