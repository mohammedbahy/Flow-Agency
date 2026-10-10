import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { getPermissionsForRole } from "../constants/permissions.js";
import HttpError from "../utils/http-error.js";

/**
 * Verifies the `Authorization: Bearer <token>` header, loads the matching
 * user, and populates `req.user` (a Mongoose document exposing `_id` + `role`).
 *
 * Integration seam: when `req.user` is already attached (test harness via
 * `createApp({ identityMiddleware })`, or a future upstream authenticator),
 * it is trusted as-is and no token check runs.
 *
 * Guards fail closed: any missing/invalid/expired token yields 401 and the
 * request never reaches a controller.
 */
export const requireAuth = async (req, res, next) => {
  try {
    if (req.user?._id && req.user?.role) {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw HttpError.unauthorized("Authentication required");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw HttpError.unauthorized("Invalid authentication token");
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      throw HttpError.unauthorized("Session expired. Please log in again.");
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error instanceof HttpError) {
      return next(error);
    }
    return next(HttpError.unauthorized("Invalid or expired token"));
  }
};

/**
 * Role guard. Usage: `requireRole(ROLES.ADMIN, ROLES.ACCOUNT_MANAGER)`.
 * Must be mounted after `requireAuth`.
 */
export const requireRole =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(HttpError.unauthorized("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        HttpError.forbidden(
          "You do not have permission to perform this action",
        ),
      );
    }

    return next();
  };

/**
 * Permission guard backed by the static matrix in `constants/permissions.js`
 * (FLW-173). Usage: `requirePermission(PERMISSIONS.USERS_CREATE)`.
 * Every listed permission is required. Must be mounted after `requireAuth`.
 */
export const requirePermission =
  (...requiredPermissions) =>
  (req, res, next) => {
    if (!req.user) {
      return next(HttpError.unauthorized("Authentication required"));
    }

    const granted = getPermissionsForRole(req.user.role);
    const allowed = requiredPermissions.every((permission) =>
      granted.includes(permission),
    );

    if (!allowed) {
      return next(
        HttpError.forbidden(
          "You do not have permission to perform this action",
        ),
      );
    }

    return next();
  };
