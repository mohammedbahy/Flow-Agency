import HttpError from "../utils/http-error.js";
import { assertValidObjectId } from "../utils/object-id.js";

export const validateAssignTeamPayload = (body = {}) => {
  const errors = [];
  const { teamId } = body;

  if (teamId === undefined || teamId === null || teamId === "") {
    errors.push({ field: "teamId", message: "teamId is required" });
  } else {
    try {
      assertValidObjectId(teamId, "team id");
    } catch {
      errors.push({ field: "teamId", message: "teamId must be a valid id" });
    }
  }

  if (errors.length) {
    throw HttpError.badRequest("Validation failed", errors);
  }
  return { teamId };
};
