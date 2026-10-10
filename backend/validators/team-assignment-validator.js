import mongoose from "mongoose";
import HttpError from "../utils/http-error.js";

const ASSIGNMENT_FIELDS = ["teamId"];

export const validateAssignTeamPayload = (body = {}) => {
  const errors = [];

  for (const key of Object.keys(body)) {
    if (!ASSIGNMENT_FIELDS.includes(key)) {
      errors.push({ field: key, message: `Unknown field: ${key}` });
    }
  }

  if (typeof body.teamId !== "string" || !mongoose.isObjectIdOrHexString(body.teamId)) {
    errors.push({ field: "teamId", message: "teamId must be a valid team id" });
  }

  if (errors.length > 0) {
    throw HttpError.badRequest("Validation failed", errors);
  }

  return { teamId: body.teamId };
};
