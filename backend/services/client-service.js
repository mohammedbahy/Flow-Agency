import Client from "../models/client.js";
import User from "../models/user.js";
import { ROLES } from "../constants/roles.js";
import HttpError from "../utils/http-error.js";
import { assertValidObjectId } from "../utils/object-id.js";
import { getTeamAssignmentsForClient } from "./team-assignment-service.js";

const ACCOUNT_MANAGER_POPULATE_SELECT = "name email role";

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const formatAccountManager = (accountManager) => {
  if (!accountManager) {
    return null;
  }
  return {
    id: String(accountManager._id),
    name: accountManager.name,
    email: accountManager.email,
    role: accountManager.role,
  };
};

const formatClient = (client) => ({
  id: String(client._id),
  name: client.name,
  description: client.description ?? null,
  email: client.email ?? null,
  phone: client.phone ?? null,
  status: client.status,
  notes: client.notes ?? null,
  accountManager: formatAccountManager(client.accountManager),
  createdBy: client.createdBy ? String(client.createdBy) : null,
  createdAt: client.createdAt,
  updatedAt: client.updatedAt,
});

const assertAccountManagerExists = async (userId) => {
  const exists = await User.exists({ _id: userId, role: ROLES.ACCOUNT_MANAGER });
  if (!exists) {
    throw HttpError.badRequest("Validation failed", [
      {
        field: "accountManager",
        message: "accountManager must reference an existing account manager",
      },
    ]);
  }
};

export const createClient = async (payload, actor) => {
  if (payload.accountManager) {
    await assertAccountManagerExists(payload.accountManager);
  }

  const client = await Client.create({ ...payload, createdBy: actor._id });

  if (client.accountManager) {
    await client.populate("accountManager", ACCOUNT_MANAGER_POPULATE_SELECT);
  }

  return formatClient(client);
};

export const listClients = async (query) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  }

  if (query.accountManager) {
    filter.accountManager = query.accountManager;
  }

  if (query.search) {
    const pattern = new RegExp(escapeRegExp(query.search), "i");
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  const [total, clients] = await Promise.all([
    Client.countDocuments(filter),
    Client.find(filter)
      .sort({ createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .populate("accountManager", ACCOUNT_MANAGER_POPULATE_SELECT)
      .lean(),
  ]);

  return {
    items: clients.map(formatClient),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
};

export const getClientDetail = async (clientId, actor) => {
  assertValidObjectId(clientId, "client id");

  const client = await Client.findById(clientId)
    .populate("accountManager", ACCOUNT_MANAGER_POPULATE_SELECT)
    .lean();

  if (!client) {
    throw HttpError.notFound("Client not found");
  }

  const isOwnAccountManager =
    client.accountManager && String(client.accountManager._id) === String(actor._id);

  if (actor.role === ROLES.ACCOUNT_MANAGER && !isOwnAccountManager) {
    throw HttpError.forbidden("Account managers can only view clients assigned to them");
  }

  const teams = await getTeamAssignmentsForClient(clientId);

  return { ...formatClient(client), teams };
};

export const updateClient = async (clientId, payload) => {
  assertValidObjectId(clientId, "client id");

  if (payload.accountManager) {
    await assertAccountManagerExists(payload.accountManager);
  }

  const client = await Client.findByIdAndUpdate(
    clientId,
    { $set: payload },
    { new: true, runValidators: true },
  )
    .populate("accountManager", ACCOUNT_MANAGER_POPULATE_SELECT)
    .lean();

  if (!client) {
    throw HttpError.notFound("Client not found");
  }

  return formatClient(client);
};
