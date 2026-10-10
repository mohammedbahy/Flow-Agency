import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../utils/pagination.js";
import {
  collectEnum,
  collectObjectId,
  collectOptionalString,
  collectRequiredString,
  parseIntParam,
  throwIfErrors,
} from "../utils/validation.js";

const TEAM_STATUSES = ["active", "inactive"];

export const validateCreateTeamPayload = (body = {}) => {
  const errors = [];
  const name = collectRequiredString(
    body.name,
    "name",
    { min: 2, max: 100 },
    errors,
  );
  const description = collectOptionalString(
    body.description,
    "description",
    { max: 1000 },
    errors,
  );
  throwIfErrors(errors);
  return { name, description };
};

export const validateUpdateTeamPayload = (body = {}) => {
  const errors = [];

  if (body.name === undefined && body.description === undefined) {
    errors.push({
      field: "body",
      message: "At least one of name or description must be provided",
    });
  }

  const name =
    body.name === undefined
      ? undefined
      : collectRequiredString(body.name, "name", { min: 2, max: 100 }, errors);
  const description =
    body.description === undefined
      ? undefined
      : collectOptionalString(body.description, "description", { max: 1000 }, errors);

  throwIfErrors(errors);
  return { name, description };
};

export const validateListTeamsQuery = (query = {}) => {
  const errors = [];
  const page = parseIntParam(query.page, "page", { min: 1, fallback: 1 }, errors);
  const limit = parseIntParam(
    query.limit,
    "limit",
    { min: 1, max: MAX_PAGE_SIZE, fallback: DEFAULT_PAGE_SIZE },
    errors,
  );
  const search = collectOptionalString(query.search, "search", { max: 100 }, errors);
  const status = collectEnum(query.status, "status", TEAM_STATUSES, errors);

  throwIfErrors(errors);
  return { page, limit, search, status };
};

/** Accepts `userIds: []` (preferred) or a single `userId`. */
export const validateAddMembersPayload = (body = {}) => {
  const errors = [];
  const raw =
    body.userIds ?? (body.userId !== undefined ? [body.userId] : undefined);

  if (!Array.isArray(raw) || raw.length === 0) {
    errors.push({
      field: "userIds",
      message: "userIds must be a non-empty array of user ids",
    });
    throwIfErrors(errors);
  }

  const userIds = [];
  for (const value of raw) {
    const id = collectObjectId(value, "userIds", errors);
    if (id && !userIds.includes(id)) {
      userIds.push(id);
    }
  }

  throwIfErrors(errors);
  return { userIds };
};

export const validateRemoveMemberParams = (params = {}) => {
  const errors = [];
  const userId = collectObjectId(params.userId, "userId", errors, {
    required: true,
  });
  throwIfErrors(errors);
  return { userId };
};
