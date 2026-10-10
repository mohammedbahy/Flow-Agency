import Task from "../models/task.js";
import { TASK_STATUS } from "../constants/task-status.js";
import { calculateDeadline } from "../utils/deadline.js";
import { buildPagination } from "../utils/pagination.js";
import HttpError from "../utils/http-error.js";
import { assertValidObjectId } from "../utils/object-id.js";
import { getActiveRules } from "./deadline-rule-service.js";

export const formatTask = (task) => ({
  id: String(task._id),
  title: task.title ?? null,
  taskType: task.taskType,
  status: task.status,
  publishingDate: task.publishingDate ?? null,
  deadline: task.deadline ?? null,
  deadlineOverridden: task.deadlineOverridden ?? false,
  assignee: task.assignee ? String(task.assignee) : null,
  client: task.client ? String(task.client) : null,
  team: task.team ? String(task.team) : null,
  createdBy: task.createdBy ? String(task.createdBy) : null,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

const findTaskOrThrow = async (taskId) => {
  assertValidObjectId(taskId, "task id");
  const task = await Task.findById(taskId);
  if (!task) {
    throw HttpError.notFound("Task not found");
  }
  return task;
};

/** FLW-227: derive the deadline from the active rule for the task type. */
const computeDeadline = async (taskType, publishingDate) => {
  if (!taskType || !publishingDate) {
    return null;
  }
  const rules = await getActiveRules();
  return calculateDeadline(taskType, publishingDate, rules);
};

export const createTask = async (payload, actor) => {
  let deadline = null;
  let deadlineOverridden = false;

  if (payload.deadline) {
    // Manual deadline on creation wins and is locked against auto-calculation.
    deadline = payload.deadline;
    deadlineOverridden = true;
  } else {
    deadline = await computeDeadline(payload.taskType, payload.publishingDate);
  }

  const task = await Task.create({
    title: payload.title,
    taskType: payload.taskType,
    status: payload.status ?? TASK_STATUS.PENDING,
    publishingDate: payload.publishingDate ?? null,
    deadline,
    deadlineOverridden,
    assignee: payload.assignee ?? null,
    client: payload.client ?? null,
    team: payload.team ?? null,
    createdBy: actor?._id ?? null,
  });

  return formatTask(task);
};

export const listTasks = async ({
  page,
  limit,
  status,
  taskType,
  clientId,
  teamId,
  assigneeId,
}) => {
  const filter = {};
  if (status) {
    filter.status = status;
  }
  if (taskType) {
    filter.taskType = taskType;
  }
  if (clientId) {
    filter.client = clientId;
  }
  if (teamId) {
    filter.team = teamId;
  }
  if (assigneeId) {
    filter.assignee = assigneeId;
  }

  const [items, total] = await Promise.all([
    Task.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Task.countDocuments(filter),
  ]);

  return {
    items: items.map(formatTask),
    pagination: buildPagination(page, limit, total),
  };
};

export const getTaskDetail = async (taskId) =>
  formatTask(await findTaskOrThrow(taskId));

/**
 * FLW-227: when the publishing date (or task type) changes, recompute the
 * deadline from the active rule - unless the deadline was manually overridden,
 * in which case it is preserved. Passing `recalculateDeadline: true` clears the
 * override and recomputes from the current values.
 */
export const updateTask = async (taskId, payload) => {
  const task = await findTaskOrThrow(taskId);

  if (payload.title !== undefined) {
    task.title = payload.title;
  }
  if (payload.taskType !== undefined) {
    task.taskType = payload.taskType;
  }
  if (payload.status !== undefined) {
    task.status = payload.status;
  }
  if (payload.assignee !== undefined) {
    task.assignee = payload.assignee;
  }
  if (payload.client !== undefined) {
    task.client = payload.client;
  }
  if (payload.team !== undefined) {
    task.team = payload.team;
  }
  if (payload.publishingDate !== undefined) {
    task.publishingDate = payload.publishingDate;
  }

  // An explicit deadline is a manual override (null clears it).
  if (payload.deadline !== undefined) {
    task.deadline = payload.deadline;
    task.deadlineOverridden = payload.deadline !== null;
  }

  // Opt-in: drop the manual override and let the rule drive the deadline again.
  if (payload.recalculateDeadline === true) {
    task.deadlineOverridden = false;
  }

  const inputsChanged =
    payload.publishingDate !== undefined || payload.taskType !== undefined;
  const shouldRecalculate =
    !task.deadlineOverridden &&
    (inputsChanged || payload.recalculateDeadline === true);

  if (shouldRecalculate) {
    task.deadline = await computeDeadline(task.taskType, task.publishingDate);
  }

  await task.save();
  return formatTask(task);
};

export const deleteTask = async (taskId) => {
  await findTaskOrThrow(taskId);
  await Task.deleteOne({ _id: taskId });
};
