import mongoose from "mongoose";
import HttpError from "../utils/http-error.js";
import { parsePositiveInt } from "./client-validator.js";

export const TASK_STATUSES = ["pending", "in_progress", "completed", "cancelled"];

const CREATE_FIELDS = ["title", "description", "client", "team", "assignedTo"];
const LEGACY_CREATE_FIELDS = [
  "title",
  "description",
  "client",
  "team",
  "assignedTo",
  "assignee",
  "taskType",
  "status",
  "publishingDate",
  "deadline",
];
const UPDATE_FIELDS = ["title", "description", "assignedTo", "status"];
const LEGACY_UPDATE_FIELDS = [
  "title",
  "description",
  "assignedTo",
  "assignee",
  "status",
  "taskType",
  "publishingDate",
  "deadline",
  "recalculateDeadline",
];
const LIST_QUERY_FIELDS = ["search", "status", "taskType", "clientId", "teamId", "assigneeId", "page", "limit"];
const LEGACY_TASK_TYPES = ["design", "content", "development", "video", "seo", "other"];

const TITLE_MIN_LENGTH = 2;
const TITLE_MAX_LENGTH = 100;
const TEXT_MAX_LENGTH = 2000;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const collectUnknownFields = (source, allowedFields, errors) => {
  for (const key of Object.keys(source)) {
    if (!allowedFields.includes(key)) {
      errors.push({ field: key, message: `Unknown field: ${key}` });
    }
  }
};

const validateTitle = (value, errors) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push({ field: "title", message: "title is required" });
    return undefined;
  }
  const title = value.trim();
  if (title.length < TITLE_MIN_LENGTH || title.length > TITLE_MAX_LENGTH) {
    errors.push({
      field: "title",
      message: `title must be between ${TITLE_MIN_LENGTH} and ${TITLE_MAX_LENGTH} characters`,
    });
    return undefined;
  }
  return title;
};

const validateDescription = (value, errors) => {
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== "string") {
    errors.push({ field: "description", message: "description must be a string" });
    return undefined;
  }
  const text = value.trim();
  if (text.length === 0) {
    return null;
  }
  if (text.length > TEXT_MAX_LENGTH) {
    errors.push({ field: "description", message: `description must be at most ${TEXT_MAX_LENGTH} characters` });
    return undefined;
  }
  return text;
};

const validateRequiredRef = (value, field, errors) => {
  if (typeof value !== "string" || !mongoose.isObjectIdOrHexString(value)) {
    errors.push({ field, message: `${field} must be a valid id` });
    return undefined;
  }
  return value;
};

const validateOptionalRef = (value, field, errors) => {
  if (value === null || value === "") {
    return null;
  }
  return validateRequiredRef(value, field, errors);
};

const validateStatus = (value, errors) => {
  if (TASK_STATUSES.includes(value)) {
    return value;
  }
  errors.push({ field: "status", message: `status must be one of: ${TASK_STATUSES.join(", ")}` });
  return undefined;
};

const validateTaskType = (value, errors) => {
  if (LEGACY_TASK_TYPES.includes(value)) {
    return value;
  }
  errors.push({ field: "taskType", message: `taskType must be one of: ${LEGACY_TASK_TYPES.join(", ")}` });
  return undefined;
};

const validateDateField = (value, field, errors) => {
  if (value === null) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    errors.push({ field, message: `${field} must be a valid date` });
    return undefined;
  }
  return date;
};

export const validateCreateTaskPayload = (body = {}) => {
  // Legacy delivery pipeline: payloads carrying taskType use the
  // auto-deadline contract (title/client/team optional).
  if ("taskType" in body) {
    return validateLegacyCreateTaskPayload(body);
  }
  const errors = [];
  collectUnknownFields(body, CREATE_FIELDS, errors);
  const payload = {};

  const title = validateTitle(body.title, errors);
  if (title !== undefined) {
    payload.title = title;
  }

  if ("description" in body) {
    const description = validateDescription(body.description, errors);
    if (description !== undefined) {
      payload.description = description;
    }
  }

  const client = validateRequiredRef(body.client, "client", errors);
  if (client !== undefined) {
    payload.client = client;
  }

  const team = validateRequiredRef(body.team, "team", errors);
  if (team !== undefined) {
    payload.team = team;
  }

  if ("assignedTo" in body) {
    const assignedTo = validateOptionalRef(body.assignedTo, "assignedTo", errors);
    if (assignedTo !== undefined) {
      payload.assignedTo = assignedTo;
    }
  }

  if (errors.length > 0) {
    throw HttpError.badRequest("Validation failed", errors);
  }

  return payload;
};

const validateLegacyCreateTaskPayload = (body = {}) => {
  const errors = [];
  collectUnknownFields(body, LEGACY_CREATE_FIELDS, errors);
  const payload = {};

  const taskType = validateTaskType(body.taskType, errors);
  if (taskType !== undefined) {
    payload.taskType = taskType;
  }

  if ("title" in body && body.title !== undefined && body.title !== null) {
    const title = validateTitle(String(body.title), errors);
    if (title !== undefined) {
      payload.title = title;
    }
  }

  if ("status" in body) {
    const status = validateStatus(body.status, errors);
    if (status !== undefined) {
      payload.status = status;
    }
  }

  if ("publishingDate" in body) {
    const publishingDate = validateDateField(body.publishingDate, "publishingDate", errors);
    if (publishingDate !== undefined) {
      payload.publishingDate = publishingDate;
    }
  }

  if ("deadline" in body) {
    const deadline = validateDateField(body.deadline, "deadline", errors);
    if (deadline !== undefined) {
      payload.deadline = deadline;
    }
  }

  for (const ref of ["assignee", "client", "team", "assignedTo"]) {
    if (ref in body && body[ref] !== undefined && body[ref] !== null) {
      const value = validateRequiredRef(body[ref], ref, errors);
      if (value !== undefined) {
        payload[ref] = value;
      }
    }
  }

  if (errors.length > 0) {
    throw HttpError.badRequest("Validation failed", errors);
  }

  return payload;
};

export const validateUpdateTaskPayload = (body = {}) => {
  // Legacy keys route to the extended field set (deadline recompute flow).
  const legacy = ["taskType", "publishingDate", "deadline", "recalculateDeadline", "assignee"].some(
    (key) => key in body,
  );
  const errors = [];
  collectUnknownFields(body, legacy ? LEGACY_UPDATE_FIELDS : UPDATE_FIELDS, errors);
  const payload = {};

  if ("title" in body) {
    const title = validateTitle(body.title, errors);
    if (title !== undefined) {
      payload.title = title;
    }
  }

  if ("description" in body) {
    const description = validateDescription(body.description, errors);
    if (description !== undefined) {
      payload.description = description;
    }
  }

  if ("assignedTo" in body) {
    const assignedTo = validateOptionalRef(body.assignedTo, "assignedTo", errors);
    if (assignedTo !== undefined) {
      payload.assignedTo = assignedTo;
    }
  }

  if ("status" in body) {
    const status = validateStatus(body.status, errors);
    if (status !== undefined) {
      payload.status = status;
    }
  }

  if ("taskType" in body) {
    const taskType = validateTaskType(body.taskType, errors);
    if (taskType !== undefined) {
      payload.taskType = taskType;
    }
  }

  if ("publishingDate" in body) {
    const publishingDate = validateDateField(body.publishingDate, "publishingDate", errors);
    if (publishingDate !== undefined) {
      payload.publishingDate = publishingDate;
    }
  }

  if ("deadline" in body) {
    const deadline = validateDateField(body.deadline, "deadline", errors);
    if (deadline !== undefined) {
      payload.deadline = deadline;
    }
  }

  if ("assignee" in body) {
    if (body.assignee === null || body.assignee === "") {
      payload.assignee = null;
    } else {
      const assignee = validateRequiredRef(body.assignee, "assignee", errors);
      if (assignee !== undefined) {
        payload.assignee = assignee;
      }
    }
  }

  if ("recalculateDeadline" in body) {
    if (typeof body.recalculateDeadline !== "boolean") {
      errors.push({ field: "recalculateDeadline", message: "recalculateDeadline must be a boolean" });
    } else {
      payload.recalculateDeadline = body.recalculateDeadline;
    }
  }

  if (errors.length > 0) {
    throw HttpError.badRequest("Validation failed", errors);
  }

  if (Object.keys(payload).length === 0) {
    throw HttpError.badRequest("Validation failed", [
      { field: "body", message: "At least one updatable field must be provided" },
    ]);
  }

  return payload;
};

export const validateListTasksQuery = (query = {}) => {
  const errors = [];
  collectUnknownFields(query, LIST_QUERY_FIELDS, errors);
  const filter = { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT };

  if ("search" in query) {
    if (typeof query.search !== "string") {
      errors.push({ field: "search", message: "search must be a string" });
    } else if (query.search.trim().length > 0) {
      filter.search = query.search.trim();
    }
  }

  if ("status" in query) {
    if (typeof query.status === "string" && TASK_STATUSES.includes(query.status)) {
      filter.status = query.status;
    } else {
      errors.push({ field: "status", message: `status must be one of: ${TASK_STATUSES.join(", ")}` });
    }
  }

  if ("clientId" in query) {
    if (typeof query.clientId === "string" && mongoose.isObjectIdOrHexString(query.clientId)) {
      filter.clientId = query.clientId;
    } else {
      errors.push({ field: "clientId", message: "clientId must be a valid client id" });
    }
  }

  if ("teamId" in query) {
    if (typeof query.teamId === "string" && mongoose.isObjectIdOrHexString(query.teamId)) {
      filter.teamId = query.teamId;
    } else {
      errors.push({ field: "teamId", message: "teamId must be a valid team id" });
    }
  }

  if ("taskType" in query) {
    if (typeof query.taskType === "string" && LEGACY_TASK_TYPES.includes(query.taskType)) {
      filter.taskType = query.taskType;
    } else {
      errors.push({ field: "taskType", message: `taskType must be one of: ${LEGACY_TASK_TYPES.join(", ")}` });
    }
  }

  if ("assigneeId" in query) {
    if (typeof query.assigneeId === "string" && mongoose.isObjectIdOrHexString(query.assigneeId)) {
      filter.assigneeId = query.assigneeId;
    } else {
      errors.push({ field: "assigneeId", message: "assigneeId must be a valid user id" });
    }
  }

  if ("page" in query) {
    const page = parsePositiveInt(query.page, "page", Number.POSITIVE_INFINITY, errors);
    if (page !== undefined) {
      filter.page = page;
    }
  }

  if ("limit" in query) {
    const limit = parsePositiveInt(query.limit, "limit", MAX_LIMIT, errors);
    if (limit !== undefined) {
      filter.limit = limit;
    }
  }

  if (errors.length > 0) {
    throw HttpError.badRequest("Validation failed", errors);
  }

  return filter;
};
