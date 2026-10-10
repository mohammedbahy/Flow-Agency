import Brand from "../models/brand.js";
import Client from "../models/client.js";
import Task from "../models/task.js";
import TeamAssignment from "../models/team-assignment.js";
import { ROLES } from "../constants/roles.js";
import HttpError from "../utils/http-error.js";
import { assertValidObjectId } from "../utils/object-id.js";

const CLIENT_POPULATE_SELECT = "name";
const TEAM_SELECT = "name description status members";
const TASK_STATUSES = ["pending", "in_progress", "completed", "cancelled"];

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const formatRef = (ref) => {
  if (!ref) {
    return null;
  }
  return { id: String(ref._id), name: ref.name };
};

const formatBrand = (brand) => ({
  id: String(brand._id),
  name: brand.name,
  description: brand.description ?? null,
  client: formatRef(brand.client),
  status: brand.status,
  createdBy: brand.createdBy ? String(brand.createdBy) : null,
  createdAt: brand.createdAt,
  updatedAt: brand.updatedAt,
});

const assertBrandAccess = (brand, actor) => {
  if (actor.role === ROLES.ADMIN) {
    return;
  }
  if (String(brand.client?.accountManager) !== String(actor._id)) {
    throw HttpError.forbidden("Account managers can only access brands of clients assigned to them");
  }
};

const getBrandInScope = async (brandId, actor) => {
  assertValidObjectId(brandId, "brand id");

  const brand = await Brand.findById(brandId)
    .populate("client", "name accountManager")
    .lean();

  if (!brand) {
    throw HttpError.notFound("Brand not found");
  }

  assertBrandAccess(brand, actor);

  return brand;
};

const countTasksByStatus = async (clientId) => {
  const grouped = await Task.aggregate([
    { $match: { client: clientId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
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

  return { total, byStatus };
};

export const createBrand = async (payload, actor) => {
  const client = await Client.findById(payload.client).select("_id").lean();
  if (!client) {
    throw HttpError.notFound("Client not found");
  }

  let brand;
  try {
    brand = await Brand.create({ ...payload, createdBy: actor._id });
  } catch (error) {
    if (error?.code === 11000) {
      throw HttpError.conflict("A brand already exists for this client");
    }
    throw error;
  }

  await brand.populate("client", CLIENT_POPULATE_SELECT);

  return formatBrand(brand);
};

export const listBrands = async (query, actor) => {
  const filter = {};
  const and = [];

  if (actor.role === ROLES.ACCOUNT_MANAGER) {
    const clientIds = await Client.distinct("_id", { accountManager: actor._id });
    and.push({ client: { $in: clientIds } });
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    filter.name = new RegExp(escapeRegExp(query.search), "i");
  }

  if (and.length > 0) {
    filter.$and = and;
  }

  const [total, brands] = await Promise.all([
    Brand.countDocuments(filter),
    Brand.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .populate("client", CLIENT_POPULATE_SELECT)
      .lean(),
  ]);

  return {
    items: brands.map(formatBrand),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getBrandWorkflow = async (brandId, actor) => {
  const brand = await getBrandInScope(brandId, actor);

  const [assignments, taskCounts] = await Promise.all([
    TeamAssignment.find({ client: brand.client._id })
      .sort({ assignedAt: -1 })
      .populate({
        path: "team",
        select: TEAM_SELECT,
        populate: { path: "members", select: "name" },
      })
      .lean(),
    countTasksByStatus(brand.client._id),
  ]);

  const teams = assignments
    .filter((assignment) => assignment.team)
    .map((assignment) => ({
      id: String(assignment.team._id),
      name: assignment.team.name,
      description: assignment.team.description ?? null,
      status: assignment.team.status,
      memberCount: assignment.team.members?.length ?? 0,
      members: (assignment.team.members ?? []).map((member) => ({
        id: String(member._id),
        name: member.name,
      })),
    }));

  return {
    brand: {
      id: String(brand._id),
      name: brand.name,
      description: brand.description ?? null,
      status: brand.status,
      client: formatRef(brand.client),
    },
    teams,
    workflow: {
      totalTasks: taskCounts.total,
      byStatus: taskCounts.byStatus,
    },
  };
};

export const getBrandMetrics = async (brandId, actor) => {
  const brand = await getBrandInScope(brandId, actor);

  const [taskCounts, completionTime] = await Promise.all([
    countTasksByStatus(brand.client._id),
    Task.aggregate([
      { $match: { client: brand.client._id, status: "completed" } },
      { $group: { _id: null, averageMs: { $avg: { $subtract: ["$completedAt", "$createdAt"] } } } },
    ]),
  ]);

  const denominator = taskCounts.total - taskCounts.byStatus.cancelled;
  const completionRate = denominator > 0 ? Math.round((taskCounts.byStatus.completed / denominator) * 1000) / 10 : null;
  const averageCompletionTimeMs = completionTime.length > 0 ? completionTime[0].averageMs : null;

  return {
    brand: {
      id: String(brand._id),
      name: brand.name,
    },
    completionRate,
    averageCompletionTimeMs,
  };
};
