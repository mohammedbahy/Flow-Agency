import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../utils/pagination.js";
import {
  collectDate,
  collectObjectId,
  parseIntParam,
  throwIfErrors,
} from "../utils/validation.js";

export const validateCompletionRateQuery = (query = {}) => {
  const errors = [];

  const from = collectDate(query.from, "from", errors);
  const to = collectDate(query.to, "to", errors);
  const clientId = collectObjectId(query.clientId, "clientId", errors);
  const teamId = collectObjectId(query.teamId, "teamId", errors);

  if (from && to && from > to) {
    errors.push({ field: "to", message: "to must be after from" });
  }

  throwIfErrors(errors);
  return { from, to, clientId, teamId };
};

export const validateDelayedTasksQuery = (query = {}) => {
  const errors = [];

  const page = parseIntParam(query.page, "page", { min: 1, fallback: 1 }, errors);
  const limit = parseIntParam(
    query.limit,
    "limit",
    { min: 1, max: MAX_PAGE_SIZE, fallback: DEFAULT_PAGE_SIZE },
    errors,
  );
  const clientId = collectObjectId(query.clientId, "clientId", errors);
  const teamId = collectObjectId(query.teamId, "teamId", errors);
  const assigneeId = collectObjectId(query.assigneeId, "assigneeId", errors);

  throwIfErrors(errors);
  return { page, limit, clientId, teamId, assigneeId };
};
