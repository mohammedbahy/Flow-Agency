import Client from "../models/client.js";
import Team from "../models/team.js";
import Task from "../models/task.js";
import TeamAssignment from "../models/team-assignment.js";
import User from "../models/user.js";
import { ROLES } from "../constants/roles.js";
import HttpError from "../utils/http-error.js";
import { assertValidObjectId } from "../utils/object-id.js";
import { calculateDeadline } from "../utils/deadline.js";
import { getActiveRules } from "./deadline-rule-service.js";

const REF_POPULATE_SELECT = "name";

const STATUS_TRANSITIONS = Object.freeze({
  pending: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: ["pending", "in_progress"],
  cancelled: [],
});

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const formatRef = (ref) => {
  if (!ref) {
    return null;
  }
  if (ref._id) {
    return { id: String(ref._id), name: ref.name ?? null };
  }
  return { id: String(ref), name: null };
};

const formatTask = (task) => ({
  id: String(task._id),
  title: task.title ?? null,
  description: task.description ?? null,
  status: task.status,
  client: formatRef(task.client),
  team: formatRef(task.team),
  assignedTo: formatRef(task.assignedTo),
  completedAt: task.completedAt ?? null,
  createdBy: task.createdBy ? String(task.createdBy) : null,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  // Legacy delivery pipeline fields (present when the task uses them).
  taskType: task.taskType ?? null,
  publishingDate: task.publishingDate ?? null,
  deadline: task.deadline ?? null,
  deadlineOverridden: task.deadlineOverridden ?? false,
  assignee: task.assignee ? String(task.assignee._id ?? task.assignee) : null,
});

const assertTeamAssignedToClient = async (clientId, teamId) => {
  const assigned = await TeamAssignment.exists({ client: clientId, team: teamId });
  if (!assigned) {
    throw HttpError.badRequest("Validation failed", [
      { field: "team", message: "Team is not assigned to this client" },
    ]);
  }
};

const assertAssigneeExists = async (assigneeId) => {
  const exists = await User.exists({ _id: assigneeId });
  if (!exists) {
    throw HttpError.badRequest("Validation failed", [
      { field: "assignedTo", message: "assignedTo must reference an existing user" },
    ]);
  }
};

const assertAssigneeIsTeamMember = (team, assigneeId) => {
  const isMember = team?.members?.some((memberId) => String(memberId) === String(assigneeId));
  if (!isMember) {
    throw HttpError.badRequest("Validation failed", [
      { field: "assignedTo", message: "assignedTo must be a member of the assigned team" },
    ]);
  }
};

const assertClientInActorScope = (client, actor) => {
  if (actor.role !== ROLES.ACCOUNT_MANAGER) {
    return;
  }
  if (!client || !client.accountManager || String(client.accountManager) !== String(actor._id)) {
    throw HttpError.forbidden("Account managers can only access tasks of clients assigned to them");
  }
};

const assertTaskAccess = async (task, actor) => {
  if (actor.role === ROLES.ADMIN) {
    return;
  }

  if (actor.role === ROLES.ACCOUNT_MANAGER) {
    const client = await Client.findById(task.client).select("accountManager").lean();
    assertClientInActorScope(client, actor);
    return;
  }

  if (!task.assignedTo || String(task.assignedTo) !== String(actor._id)) {
    throw HttpError.forbidden("Employees can only access tasks assigned to them");
  }
};

export const createTask = async (payload, actor) => {
  // Legacy delivery pipeline: taskType payloads use auto-deadline creation
  // without the client/team workflow checks.
  if (payload.taskType) {
    return createLegacyTask(payload, actor);
  }

  const [client, team] = await Promise.all([
    Client.findById(payload.client).select("accountManager").lean(),
    Team.findById(payload.team).select("members").lean(),
  ]);

  if (!client) {
    throw HttpError.notFound("Client not found");
  }

  if (!team) {
    throw HttpError.notFound("Team not found");
  }

  assertClientInActorScope(client, actor);
  await assertTeamAssignedToClient(payload.client, payload.team);

  if (payload.assignedTo) {
    await assertAssigneeExists(payload.assignedTo);
    assertAssigneeIsTeamMember(team, payload.assignedTo);
  }

  const task = await Task.create({ ...payload, createdBy: actor._id });

  await task.populate("client", REF_POPULATE_SELECT);
  await task.populate("team", REF_POPULATE_SELECT);
  await task.populate("assignedTo", REF_POPULATE_SELECT);

  return formatTask(task);
};

/** Legacy creation: derive the deadline from the active rule for the task type. */
const createLegacyTask = async (payload, actor) => {
  let deadline = null;
  let deadlineOverridden = false;

  if (payload.deadline) {
    deadline = payload.deadline;
    deadlineOverridden = true;
  } else if (payload.taskType && payload.publishingDate) {
    const rules = await getActiveRules();
    deadline = calculateDeadline(payload.taskType, payload.publishingDate, rules);
  }

  const task = await Task.create({
    title: payload.title ?? null,
    taskType: payload.taskType,
    status: payload.status ?? "pending",
    publishingDate: payload.publishingDate ?? null,
    deadline,
    deadlineOverridden,
    assignee: payload.assignee ?? null,
    assignedTo: payload.assignedTo ?? null,
    client: payload.client ?? null,
    team: payload.team ?? null,
    createdBy: actor?._id ?? null,
  });

  return formatTask(task);
};

export const listTasks = async (query, actor) => {
  const filter = {};
  const and = [];

  if (actor.role === ROLES.ACCOUNT_MANAGER) {
    const clientIds = await Client.distinct("_id", { accountManager: actor._id });
    and.push({ client: { $in: clientIds } });
  } else if (actor.role === ROLES.EMPLOYEE) {
    and.push({ assignedTo: actor._id });
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.clientId) {
    filter.client = query.clientId;
  }

  if (query.teamId) {
    filter.team = query.teamId;
  }

  if (query.taskType) {
    filter.taskType = query.taskType;
  }

  if (query.assigneeId) {
    filter.assignee = query.assigneeId;
  }

  if (query.search) {
    filter.title = new RegExp(escapeRegExp(query.search), "i");
  }

  if (and.length > 0) {
    filter.$and = and;
  }

  const [total, tasks] = await Promise.all([
    Task.countDocuments(filter),
    Task.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .populate("client", REF_POPULATE_SELECT)
      .populate("team", REF_POPULATE_SELECT)
      .populate("assignedTo", REF_POPULATE_SELECT)
      .lean(),
  ]);

  return {
    items: tasks.map(formatTask),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const updateTask = async (taskId, payload, actor) => {
  assertValidObjectId(taskId, "task id");

  const task = await Task.findById(taskId).lean();
  if (!task) {
    throw HttpError.notFound("Task not found");
  }

  await assertTaskAccess(task, actor);

  if (actor.role === ROLES.EMPLOYEE) {
    const nonStatusField = Object.keys(payload).find((key) => key !== "status");
    if (nonStatusField) {
      throw HttpError.forbidden("Employees can only update the status of tasks assigned to them");
    }
  }

  const update = { ...payload };

  // Legacy deadline recompute flow: manual deadline wins and locks the
  // override; publishingDate/taskType changes recompute unless overridden.
  // `recalculateDeadline: true` clears the override and recomputes.
  const legacyKeys = ["deadline", "publishingDate", "taskType", "recalculateDeadline"];
  const touchesLegacy = legacyKeys.some((key) => key in payload);
  if (touchesLegacy) {
    if ("deadline" in payload && payload.deadline) {
      update.deadline = payload.deadline;
      update.deadlineOverridden = true;
    } else {
      const recalc = payload.recalculateDeadline === true;
      const effectiveTaskType = payload.taskType ?? task.taskType;
      const effectivePublishingDate = payload.publishingDate ?? task.publishingDate;
      if ((recalc || !task.deadlineOverridden) && effectiveTaskType && effectivePublishingDate) {
        const rules = await getActiveRules();
        update.deadline = calculateDeadline(effectiveTaskType, effectivePublishingDate, rules);
        if (recalc) {
          update.deadlineOverridden = false;
        }
      }
      if (recalc && !update.deadline) {
        update.deadline = null;
        update.deadlineOverridden = false;
      }
    }
    delete update.recalculateDeadline;
  }

  if ("status" in update && update.status !== task.status) {
    const allowedTargets = STATUS_TRANSITIONS[task.status] ?? [];
    if (!allowedTargets.includes(update.status)) {
      throw HttpError.badRequest("Validation failed", [
        { field: "status", message: `Tasks cannot move from ${task.status} to ${update.status}` },
      ]);
    }

    if (task.status === "completed" && actor.role !== ROLES.ADMIN) {
      throw HttpError.forbidden("Only admins can reopen a completed task");
    }

    update.completedAt = update.status === "completed" ? new Date() : null;
  }

  if ("assignedTo" in update && update.assignedTo !== null) {
    await assertAssigneeExists(update.assignedTo);
    const team = await Team.findById(task.team).select("members").lean();
    assertAssigneeIsTeamMember(team, update.assignedTo);
  }

  const updated = await Task.findByIdAndUpdate(taskId, { $set: update }, { new: true, runValidators: true })
    .populate("client", REF_POPULATE_SELECT)
    .populate("team", REF_POPULATE_SELECT)
    .populate("assignedTo", REF_POPULATE_SELECT)
    .lean();

  if (!updated) {
    throw HttpError.notFound("Task not found");
  }

  return formatTask(updated);
};
