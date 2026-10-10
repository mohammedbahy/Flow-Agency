import Brand from "../models/brand.js";
import Client from "../models/client.js";
import Task from "../models/task.js";
import Team from "../models/team.js";

const TASK_STATUSES = ["pending", "in_progress", "completed", "cancelled"];

const countByStatus = async (model) => {
  const grouped = await model.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

  const counts = { total: 0, active: 0, inactive: 0 };
  for (const entry of grouped) {
    if (entry._id === "active") {
      counts.active = entry.count;
    }
    if (entry._id === "inactive") {
      counts.inactive = entry.count;
    }
    counts.total += entry.count;
  }

  return counts;
};

const getTaskStats = async () => {
  const [grouped, completionTime] = await Promise.all([
    Task.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Task.aggregate([
      { $match: { status: "completed", completedAt: { $ne: null } } },
      { $group: { _id: null, averageMs: { $avg: { $subtract: ["$completedAt", "$createdAt"] } } } },
    ]),
  ]);

  const byStatus = {};
  let total = 0;
  for (const status of TASK_STATUSES) {
    byStatus[status] = 0;
  }
  for (const entry of grouped) {
    byStatus[entry._id] = entry.count;
    total += entry.count;
  }

  const denominator = total - byStatus.cancelled;
  const completionRate = denominator > 0 ? Math.round((byStatus.completed / denominator) * 1000) / 10 : null;

  return {
    total,
    byStatus,
    completionRate,
    averageCompletionTimeMs: completionTime.length > 0 ? completionTime[0].averageMs : null,
  };
};

const getTeamStats = async () => {
  const [teams, grouped] = await Promise.all([
    Team.find().select("name status").lean(),
    Task.aggregate([{ $group: { _id: "$team", count: { $sum: 1 } } }]),
  ]);

  const countByTeamId = new Map(grouped.map((entry) => [String(entry._id), entry.count]));

  const byTeam = teams
    .map((team) => ({
      id: String(team._id),
      name: team.name,
      taskCount: countByTeamId.get(String(team._id)) ?? 0,
    }))
    .sort((a, b) => b.taskCount - a.taskCount || a.name.localeCompare(b.name));

  return {
    total: teams.length,
    active: teams.filter((team) => team.status === "active").length,
    byTeam,
  };
};

export const getDashboard = async () => {
  const [clients, tasks, teams, brands] = await Promise.all([
    countByStatus(Client),
    getTaskStats(),
    getTeamStats(),
    countByStatus(Brand),
  ]);

  return { clients, tasks, teams, brands };
};
