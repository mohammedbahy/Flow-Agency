import { TASK_STATUS_VALUES } from "../constants/task-status.js";
import { TASK_TYPES } from "../constants/task-types.js";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../utils/pagination.js";
import {
  collectBoolean,
  collectDate,
  collectEnum,
  collectObjectId,
  collectOptionalString,
  parseIntParam,
  throwIfErrors,
} from "../utils/validation.js";

const has = (object, key) =>
  Object.prototype.hasOwnProperty.call(object, key);

export const validateCreateTaskPayload = (body = {}) => {
  const errors = [];

  const title = collectOptionalString(body.title, "title", { max: 200 }, errors);
  const taskType = collectEnum(body.taskType, "taskType", TASK_TYPES, errors, {
    required: true,
  });
  const status = collectEnum(body.status, "status", TASK_STATUS_VALUES, errors);
  const publishingDate = collectDate(
    body.publishingDate,
    "publishingDate",
    errors,
  );
  const deadline = collectDate(body.deadline, "deadline", errors);
  const assignee = collectObjectId(body.assignee, "assignee", errors);
  const client = collectObjectId(body.client, "client", errors);
  const team = collectObjectId(body.team, "team", errors);

  throwIfErrors(errors);
  return {
    title,
    taskType,
    status,
    publishingDate,
    deadline,
    assignee,
    client,
    team,
  };
};

export const validateUpdateTaskPayload = (body = {}) => {
  const errors = [];
  const allowed = [
    "title",
    "taskType",
    "status",
    "publishingDate",
    "deadline",
    "assignee",
    "client",
    "team",
    "recalculateDeadline",
  ];

  if (!allowed.some((field) => has(body, field))) {
    errors.push({
      field: "body",
      message: `At least one of ${allowed.join(", ")} must be provided`,
    });
  }

  const payload = {};

  if (has(body, "title")) {
    payload.title = collectOptionalString(body.title, "title", { max: 200 }, errors);
  }
  if (has(body, "taskType")) {
    payload.taskType = collectEnum(body.taskType, "taskType", TASK_TYPES, errors, {
      required: true,
    });
  }
  if (has(body, "status")) {
    payload.status = collectEnum(body.status, "status", TASK_STATUS_VALUES, errors, {
      required: true,
    });
  }
  if (has(body, "publishingDate")) {
    payload.publishingDate =
      body.publishingDate === null
        ? null
        : collectDate(body.publishingDate, "publishingDate", errors);
  }
  if (has(body, "deadline")) {
    payload.deadline =
      body.deadline === null
        ? null
        : collectDate(body.deadline, "deadline", errors);
  }
  if (has(body, "assignee")) {
    payload.assignee =
      body.assignee === null
        ? null
        : collectObjectId(body.assignee, "assignee", errors);
  }
  if (has(body, "client")) {
    payload.client =
      body.client === null
        ? null
        : collectObjectId(body.client, "client", errors);
  }
  if (has(body, "team")) {
    payload.team =
      body.team === null ? null : collectObjectId(body.team, "team", errors);
  }
  if (has(body, "recalculateDeadline")) {
    payload.recalculateDeadline = collectBoolean(
      body.recalculateDeadline,
      "recalculateDeadline",
      errors,
    );
  }

  throwIfErrors(errors);
  return payload;
};

export const validateListTasksQuery = (query = {}) => {
  const errors = [];

  const page = parseIntParam(query.page, "page", { min: 1, fallback: 1 }, errors);
  const limit = parseIntParam(
    query.limit,
    "limit",
    { min: 1, max: MAX_PAGE_SIZE, fallback: DEFAULT_PAGE_SIZE },
    errors,
  );
  const status = collectEnum(query.status, "status", TASK_STATUS_VALUES, errors);
  const taskType = collectEnum(query.taskType, "taskType", TASK_TYPES, errors);
  const clientId = collectObjectId(query.clientId, "clientId", errors);
  const teamId = collectObjectId(query.teamId, "teamId", errors);
  const assigneeId = collectObjectId(query.assigneeId, "assigneeId", errors);

  throwIfErrors(errors);
  return { page, limit, status, taskType, clientId, teamId, assigneeId };
};
