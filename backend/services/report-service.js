import mongoose from "mongoose";
import Task from "../models/task.js";
import { COMPLETED_STATUS } from "../constants/task-status.js";
import { buildPagination } from "../utils/pagination.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toObjectId = (value) => new mongoose.Types.ObjectId(value);

/**
 * FLW-107/108: completion rate = completed / total, computed with a single
 * aggregation (no documents loaded into memory). The optional date range
 * filters on the task `publishingDate`.
 */
export const getCompletionRate = async ({ from, to, clientId, teamId }) => {
  const match = {};
  if (clientId) {
    match.client = toObjectId(clientId);
  }
  if (teamId) {
    match.team = toObjectId(teamId);
  }
  if (from || to) {
    match.publishingDate = {};
    if (from) {
      match.publishingDate.$gte = from;
    }
    if (to) {
      match.publishingDate.$lte = to;
    }
  }

  const [result] = await Task.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ["$status", COMPLETED_STATUS] }, 1, 0] },
        },
      },
    },
  ]);

  const total = result?.total ?? 0;
  const completed = result?.completed ?? 0;
  const rate = total === 0 ? 0 : Number((completed / total).toFixed(4));

  return {
    total,
    completed,
    notCompleted: total - completed,
    rate,
  };
};

/**
 * FLW-111/112: a task is delayed when `deadline < now` and status is not
 * completed. Returns a paginated list sorted by most delayed first (smallest
 * deadline). `daysOverdue` is computed server-side; tasks with no deadline are
 * excluded.
 */
export const getDelayedTasks = async ({
  page,
  limit,
  clientId,
  teamId,
  assigneeId,
}) => {
  const now = new Date();
  const match = {
    status: { $ne: COMPLETED_STATUS },
    deadline: { $ne: null, $lt: now },
  };
  if (clientId) {
    match.client = toObjectId(clientId);
  }
  if (teamId) {
    match.team = toObjectId(teamId);
  }
  if (assigneeId) {
    match.assignee = toObjectId(assigneeId);
  }

  const pipeline = [
    { $match: match },
    {
      $addFields: {
        daysOverdue: {
          $floor: {
            $divide: [{ $subtract: [now, "$deadline"] }, MS_PER_DAY],
          },
        },
      },
    },
    { $sort: { deadline: 1, _id: 1 } },
    {
      $facet: {
        data: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: "users",
              let: { assigneeId: "$assignee" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$assigneeId"] } } },
                { $project: { name: 1, email: 1 } },
              ],
              as: "assigneeDoc",
            },
          },
          {
            $lookup: {
              from: "clients",
              let: { clientId: "$client" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$clientId"] } } },
                { $project: { name: 1 } },
              ],
              as: "clientDoc",
            },
          },
          {
            $lookup: {
              from: "teams",
              let: { teamId: "$team" },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$teamId"] } } },
                { $project: { name: 1 } },
              ],
              as: "teamDoc",
            },
          },
          {
            $addFields: {
              assignee: { $arrayElemAt: ["$assigneeDoc", 0] },
              client: { $arrayElemAt: ["$clientDoc", 0] },
              team: { $arrayElemAt: ["$teamDoc", 0] },
            },
          },
          { $project: { assigneeDoc: 0, clientDoc: 0, teamDoc: 0 } },
        ],
        metadata: [{ $count: "count" }],
      },
    },
  ];

  const [result] = await Task.aggregate(pipeline);
  const total = result?.metadata?.[0]?.count ?? 0;
  const items = (result?.data ?? []).map(formatDelayedTask);

  return {
    items,
    pagination: buildPagination(page, limit, total),
  };
};

const formatDelayedTask = (task) => ({
  id: String(task._id),
  title: task.title ?? null,
  taskType: task.taskType,
  status: task.status,
  publishingDate: task.publishingDate ?? null,
  deadline: task.deadline,
  daysOverdue: task.daysOverdue,
  assignee: task.assignee
    ? {
        id: String(task.assignee._id),
        name: task.assignee.name ?? null,
        email: task.assignee.email ?? null,
      }
    : null,
  client: task.client
    ? { id: String(task.client._id), name: task.client.name ?? null }
    : null,
  team: task.team
    ? { id: String(task.team._id), name: task.team.name ?? null }
    : null,
});
