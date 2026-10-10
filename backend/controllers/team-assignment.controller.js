import * as teamAssignmentService from "../services/team-assignment-service.js";
import { validateAssignTeamPayload } from "../validators/team-assignment-validator.js";

export const assignTeamToClient = async (req, res) => {
  const { teamId } = validateAssignTeamPayload(req.body);
  const assignment = await teamAssignmentService.assignTeamToClient(
    req.params.clientId,
    teamId,
    req.user,
  );

  res.status(201).json({
    success: true,
    message: "Team assigned to client successfully",
    data: assignment,
  });
};

export const listClientTeams = async (req, res) => {
  const teams = await teamAssignmentService.listClientTeams(
    req.params.clientId,
  );

  res.status(200).json({
    success: true,
    data: teams,
  });
};

export const removeTeamAssignment = async (req, res) => {
  await teamAssignmentService.removeTeamAssignment(
    req.params.clientId,
    req.params.teamId,
  );

  res.status(200).json({
    success: true,
    message: "Team assignment removed successfully",
  });
};
