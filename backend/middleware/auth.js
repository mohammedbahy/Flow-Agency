import jwt from "jsonwebtoken";
import User from "../models/user.js";
import HttpError from "../utils/http-error.js";

/**
 * Verifies the `Authorization: Bearer <token>` header, loads the matching
 * user, and populates `req.user` (a Mongoose document exposing `_id` + `role`).
 *
 * Guards fail closed: any missing/invalid/expired token yields 401 and the
 * request never reaches a controller.
 */
export const requireAuth = async (req, res, next) => {
  try {
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
