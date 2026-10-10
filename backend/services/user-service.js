import bcrypt from "bcrypt";
import User from "../models/user.js";
import { ROLES } from "../constants/roles.js";
import { buildPagination } from "../utils/pagination.js";
import HttpError from "../utils/http-error.js";

const BCRYPT_ROUNDS = 10;
const USER_STATUS = Object.freeze({ ACTIVE: "active", INACTIVE: "inactive" });

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const formatUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  mustChangePassword: user.mustChangePassword ?? false,
  createdBy: user.createdBy ? String(user.createdBy) : null,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const findUserOrThrow = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw HttpError.notFound("User not found");
  }
  return user;
};

const countOtherActiveAdmins = (userId) =>
  User.countDocuments({
    _id: { $ne: userId },
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
  });

const assertEmailAvailable = async (email, excludeUserId = null) => {
  const filter = { email };
  if (excludeUserId) {
    filter._id = { $ne: excludeUserId };
  }
  const existing = await User.findOne(filter).select("_id");
  if (existing) {
    throw HttpError.conflict("A user with this email already exists");
  }
};

/**
 * FLW-164: Admin-only account creation. There is no invitation/registration
 * flow; the admin supplies a temporary password which is hashed and the account
 * is flagged `mustChangePassword`.
 */
export const createUser = async (payload, actor) => {
  await assertEmailAvailable(payload.email);

  const password = await bcrypt.hash(payload.password, BCRYPT_ROUNDS);

  const user = await User.create({
    name: payload.name,
    email: payload.email,
    password,
    role: payload.role,
    status: USER_STATUS.ACTIVE,
    mustChangePassword: true,
    createdBy: actor?._id ?? null,
  });

  return formatUser(user);
};

export const listUsers = async ({ page, limit, search, role, status }) => {
  const filter = {};
  if (role) {
    filter.role = role;
  }
  if (status) {
    filter.status = status;
  }
  if (search) {
    const pattern = new RegExp(escapeRegExp(search), "i");
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    items: items.map(formatUser),
    pagination: buildPagination(page, limit, total),
  };
};

export const getUserDetail = async (userId) => formatUser(await findUserOrThrow(userId));

export const updateUser = async (userId, payload) => {
  const user = await findUserOrThrow(userId);

  if (payload.email !== undefined && payload.email !== user.email) {
    await assertEmailAvailable(payload.email, user._id);
    user.email = payload.email;
  }
  if (payload.name !== undefined) {
    user.name = payload.name;
  }

  await user.save();
  return formatUser(user);
};

/**
 * FLW-173: Admin changes a user's role. Bumps `tokenVersion` so any live
 * session picks up the new permissions on next request (forces re-login).
 * Refuses to remove the last active admin.
 */
export const changeUserRole = async (userId, role) => {
  const user = await findUserOrThrow(userId);

  if (user.role === role) {
    return formatUser(user);
  }

  if (user.role === ROLES.ADMIN && role !== ROLES.ADMIN) {
    const others = await countOtherActiveAdmins(user._id);
    if (others === 0) {
      throw HttpError.conflict("Cannot change the role of the last admin");
    }
  }

  user.role = role;
  user.tokenVersion += 1;
  await user.save();
  return formatUser(user);
};

/** FLW-164: deactivate/activate. Deactivation revokes live sessions. */
export const setUserStatus = async (userId, status) => {
  const user = await findUserOrThrow(userId);

  if (user.status === status) {
    return formatUser(user);
  }

  if (status === USER_STATUS.INACTIVE && user.role === ROLES.ADMIN) {
    const others = await countOtherActiveAdmins(user._id);
    if (others === 0) {
      throw HttpError.conflict("Cannot deactivate the last admin");
    }
  }

  user.status = status;
  if (status === USER_STATUS.INACTIVE) {
    user.tokenVersion += 1;
  }
  await user.save();
  return formatUser(user);
};
