import * as teamService from "../services/team-service.js";
import {
  validateAddMembersPayload,
  validateCreateTeamPayload,
  validateListTeamsQuery,
  validateRemoveMemberParams,
  validateUpdateTeamPayload,
} from "../validators/team-validator.js";

export const createTeam = async (req, res) => {
  const payload = validateCreateTeamPayload(req.body);
  const team = await teamService.createTeam(payload, req.user);

  res.status(201).json({
    success: true,
    message: "Team created successfully",
    data: team,
  });
};

export const listTeams = async (req, res) => {
  const query = validateListTeamsQuery(req.query);
  const { items, pagination } = await teamService.listTeams(query);

  res.status(200).json({
    success: true,
    data: items,
    pagination,
  });
};

export const getTeam = async (req, res) => {
  const team = await teamService.getTeamDetail(req.params.teamId);

  res.status(200).json({
    success: true,
    data: team,
  });
};

export const updateTeam = async (req, res) => {
  const payload = validateUpdateTeamPayload(req.body);
  const team = await teamService.updateTeam(req.params.teamId, payload);

  res.status(200).json({
    success: true,
    message: "Team updated successfully",
    data: team,
  });
};

export const deleteTeam = async (req, res) => {
  await teamService.deleteTeam(req.params.teamId);

  res.status(200).json({
    success: true,
    message: "Team deleted successfully",
  });
};

export const addTeamMembers = async (req, res) => {
  const { userIds } = validateAddMembersPayload(req.body);
  const team = await teamService.addTeamMembers(req.params.teamId, userIds);

  res.status(200).json({
    success: true,
    message: "Team members added successfully",
    data: team,
  });
};

export const removeTeamMember = async (req, res) => {
  const { userId } = validateRemoveMemberParams(req.params);
  const team = await teamService.removeTeamMember(req.params.teamId, userId);

  res.status(200).json({
    success: true,
    message: "Team member removed successfully",
    data: team,
  });
};
