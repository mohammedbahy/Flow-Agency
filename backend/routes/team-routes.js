import { Router } from "express";
import { PERMISSIONS } from "../constants/permissions.js";
import {
  addTeamMembers,
  createTeam,
  deleteTeam,
  getTeam,
  listTeams,
  removeTeamMember,
  updateTeam,
} from "../controllers/team-controller.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);

router.get("/", requirePermission(PERMISSIONS.TEAMS_READ), listTeams);
router.get("/:teamId", requirePermission(PERMISSIONS.TEAMS_READ), getTeam);
router.post("/", requirePermission(PERMISSIONS.TEAMS_CREATE), createTeam);
router.patch("/:teamId", requirePermission(PERMISSIONS.TEAMS_UPDATE), updateTeam);
router.delete(
  "/:teamId",
  requirePermission(PERMISSIONS.TEAMS_DELETE),
  deleteTeam,
);

router.post(
  "/:teamId/members",
  requirePermission(PERMISSIONS.TEAMS_MANAGE_MEMBERS),
  addTeamMembers,
);
router.delete(
  "/:teamId/members/:userId",
  requirePermission(PERMISSIONS.TEAMS_MANAGE_MEMBERS),
  removeTeamMember,
);

export default router;
