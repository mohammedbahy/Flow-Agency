import Team from "../models/team.js";
import User from "../models/user.js";
import TeamAssignment from "../models/team-assignment.js";
import { buildPagination } from "../utils/pagination.js";
import HttpError from "../utils/http-error.js";

const MEMBER_SELECT = "name email role status";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const formatMember = (member) => {
  if (!member || !member._id) {
    return null;
  }
  return {
    id: String(member._id),
    name: member.name,
    email: member.email,
    role: member.role,
    status: member.status,
  };
};

export const formatTeamSummary = (team) => ({
  id: String(team._id),
  name: team.name,
  description: team.description ?? null,
  status: team.status,
  memberCount: team.members?.length ?? 0,
  createdAt: team.createdAt,
  updatedAt: team.updatedAt,
});

const formatTeamDetail = (team) => ({
  ...formatTeamSummary(team),
  members: (team.members ?? []).map(formatMember).filter(Boolean),
});

export const createTeam = async (payload, actor) => {
  const team = await Team.create({
    name: payload.name,
    description: payload.description,
    members: [],
    createdBy: actor._id,
  });
  return formatTeamSummary(team);
};

export const listTeams = async ({ page, limit, search, status }) => {
  const filter = {};
  if (status) {
    filter.status = status;
  }
  if (search) {
    filter.name = new RegExp(escapeRegExp(search), "i");
  }

  const [items, total] = await Promise.all([
    Team.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Team.countDocuments(filter),
  ]);

  return {
    items: items.map(formatTeamSummary),
    pagination: buildPagination(page, limit, total),
  };
};

export const getTeamDetail = async (teamId) => {
  const team = await Team.findById(teamId).populate("members", MEMBER_SELECT);
  if (!team) {
    throw HttpError.notFound("Team not found");
  }
  return formatTeamDetail(team);
};

export const updateTeam = async (teamId, payload) => {
  const team = await Team.findById(teamId);
  if (!team) {
    throw HttpError.notFound("Team not found");
  }

  if (payload.name !== undefined) {
    team.name = payload.name;
  }
  if (payload.description !== undefined) {
    team.description = payload.description;
  }

  await team.save();
  return getTeamDetail(teamId);
};

/**
 * FLW-182: refuse to delete a team that is assigned to one or more clients so
 * no client is left pointing at a missing team.
 */
export const deleteTeam = async (teamId) => {
  const team = await Team.findById(teamId).select("_id");
  if (!team) {
    throw HttpError.notFound("Team not found");
  }

  const assignedToClient = await TeamAssignment.exists({ team: teamId });
  if (assignedToClient) {
    throw HttpError.conflict(
      "Team is assigned to one or more clients and cannot be deleted",
    );
  }

  await Team.deleteOne({ _id: teamId });
};

export const addTeamMembers = async (teamId, userIds) => {
  const team = await Team.findById(teamId).select("_id");
  if (!team) {
    throw HttpError.notFound("Team not found");
  }

  const found = await User.countDocuments({ _id: { $in: userIds } });
  if (found !== userIds.length) {
    throw HttpError.notFound("One or more users were not found");
  }

  await Team.updateOne(
    { _id: teamId },
    { $addToSet: { members: { $each: userIds } } },
  );

  return getTeamDetail(teamId);
};

export const removeTeamMember = async (teamId, userId) => {
  const team = await Team.findById(teamId).select("_id members");
  if (!team) {
    throw HttpError.notFound("Team not found");
  }

  const isMember = (team.members ?? []).some(
    (memberId) => String(memberId) === String(userId),
  );
  if (!isMember) {
    throw HttpError.notFound("User is not a member of this team");
  }

  await Team.updateOne({ _id: teamId }, { $pull: { members: userId } });
  return getTeamDetail(teamId);
};
