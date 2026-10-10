import Client from "../models/client.js";
import Team from "../models/team.js";
import TeamAssignment from "../models/team-assignment.js";
import HttpError from "../utils/http-error.js";
import { assertValidObjectId } from "../utils/object-id.js";

const TEAM_SELECT = "name description status members";

const formatTeamSummary = (team) => ({
  id: String(team._id),
  name: team.name,
  description: team.description ?? null,
  status: team.status,
  memberCount: team.members?.length ?? 0,
});

const formatAssignment = (assignment, team) => ({
  assignmentId: String(assignment._id),
  assignedAt: assignment.assignedAt,
  assignedBy: String(assignment.assignedBy),
  team: formatTeamSummary(team),
});

const assertClientExists = async (clientId) => {
  const exists = await Client.exists({ _id: clientId });
  if (!exists) {
    throw HttpError.notFound("Client not found");
  }
};

export const assignTeamToClient = async (clientId, teamId, actor) => {
  assertValidObjectId(clientId, "client id");
  assertValidObjectId(teamId, "team id");

  const [clientExists, team] = await Promise.all([
    Client.exists({ _id: clientId }),
    Team.findById(teamId).select(TEAM_SELECT).lean(),
  ]);

  if (!clientExists) {
    throw HttpError.notFound("Client not found");
  }

  if (!team) {
    throw HttpError.notFound("Team not found");
  }

  const alreadyAssigned = await TeamAssignment.exists({
    client: clientId,
    team: teamId,
  });
  if (alreadyAssigned) {
    throw HttpError.conflict("Team is already assigned to this client");
  }

  let assignment;
  try {
    assignment = await TeamAssignment.create({
      client: clientId,
      team: teamId,
      assignedBy: actor._id,
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw HttpError.conflict("Team is already assigned to this client");
    }
    throw error;
  }

  return formatAssignment(assignment, team);
};

export const getTeamAssignmentsForClient = async (clientId) => {
  const assignments = await TeamAssignment.find({ client: clientId })
    .sort({ assignedAt: -1 })
    .populate("team", TEAM_SELECT)
    .lean();

  return assignments
    .filter((assignment) => assignment.team)
    .map((assignment) => formatAssignment(assignment, assignment.team));
};

export const listClientTeams = async (clientId) => {
  assertValidObjectId(clientId, "client id");
  await assertClientExists(clientId);
  return getTeamAssignmentsForClient(clientId);
};

export const removeTeamAssignment = async (clientId, teamId) => {
  assertValidObjectId(clientId, "client id");
  assertValidObjectId(teamId, "team id");
  await assertClientExists(clientId);

  const assignment = await TeamAssignment.findOneAndDelete({
    client: clientId,
    team: teamId,
  });
  if (!assignment) {
    throw HttpError.notFound("Team is not assigned to this client");
  }
};
