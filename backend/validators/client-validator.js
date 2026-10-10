import HttpError from "../utils/http-error.js";
import { assertValidObjectId } from "../utils/object-id.js";

const CLIENT_STATUSES = ["active", "inactive"];
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;
const MAX_TEXT_LENGTH = 2000;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 40;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isString = (value) => typeof value === "string";

const collectName = (value, errors, { required }) => {
  if (value === undefined || value === null || value === "") {
    if (required) {
      errors.push({ field: "name", message: "name is required" });
    }
    return undefined;
  }
  if (!isString(value)) {
    errors.push({ field: "name", message: "name must be a string" });
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed.length < MIN_NAME_LENGTH || trimmed.length > MAX_NAME_LENGTH) {
    errors.push({
      field: "name",
      message: `name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters`,
    });
  }
  return trimmed;
};

const collectOptionalText = (value, field, maxLength, errors) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (!isString(value)) {
    errors.push({ field, message: `${field} must be a string` });
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    errors.push({ field, message: `${field} must be at most ${maxLength} characters` });
  }
  return trimmed;
};

const collectEmail = (value, errors) => {
  const trimmed = collectOptionalText(value, "email", MAX_EMAIL_LENGTH, errors);
  if (trimmed !== undefined && !EMAIL_PATTERN.test(trimmed)) {
    errors.push({ field: "email", message: "email must be a valid email address" });
  }
  return trimmed;
};

const collectStatus = (value, errors) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (!CLIENT_STATUSES.includes(value)) {
    errors.push({
      field: "status",
      message: `status must be one of: ${CLIENT_STATUSES.join(", ")}`,
    });
    return undefined;
  }
  return value;
};

const collectAccountManager = (value, errors) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  try {
    assertValidObjectId(value, "accountManager");
  } catch {
    errors.push({ field: "accountManager", message: "accountManager must be a valid id" });
    return undefined;
  }
  return value;
};

const parseIntParam = (value, field, { min, max, fallback }, errors) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || (max !== undefined && parsed > max)) {
    const bound = max === undefined ? `at least ${min}` : `between ${min} and ${max}`;
    errors.push({ field, message: `${field} must be an integer ${bound}` });
    return fallback;
  }
  return parsed;
};

export const validateCreateClientPayload = (body = {}) => {
  const errors = [];

  const payload = {
    name: collectName(body.name, errors, { required: true }),
    description: collectOptionalText(body.description, "description", MAX_TEXT_LENGTH, errors),
    email: collectEmail(body.email, errors),
    phone: collectOptionalText(body.phone, "phone", MAX_PHONE_LENGTH, errors),
    status: collectStatus(body.status, errors),
    notes: collectOptionalText(body.notes, "notes", MAX_TEXT_LENGTH, errors),
    accountManager: collectAccountManager(body.accountManager, errors),
  };

  if (errors.length) {
    throw HttpError.badRequest("Validation failed", errors);
  }
  return payload;
};

export const validateUpdateClientPayload = (body = {}) => {
  const errors = [];
  const payload = {};

  if ("name" in body) {
    payload.name = collectName(body.name, errors, { required: true });
  }
  if ("description" in body) {
    payload.description = collectOptionalText(body.description, "description", MAX_TEXT_LENGTH, errors);
  }
  if ("email" in body) {
    payload.email = collectEmail(body.email, errors);
  }
  if ("phone" in body) {
    payload.phone = collectOptionalText(body.phone, "phone", MAX_PHONE_LENGTH, errors);
  }
  if ("status" in body) {
    payload.status = collectStatus(body.status, errors);
  }
  if ("notes" in body) {
    payload.notes = collectOptionalText(body.notes, "notes", MAX_TEXT_LENGTH, errors);
  }
  if ("accountManager" in body) {
    payload.accountManager = collectAccountManager(body.accountManager, errors);
  }

  if (!Object.keys(payload).length && !errors.length) {
    throw HttpError.badRequest("Validation failed", [
      { field: "body", message: "At least one field must be provided" },
    ]);
  }

  if (errors.length) {
    throw HttpError.badRequest("Validation failed", errors);
  }
  return payload;
};

export const validateListClientsQuery = (query = {}) => {
  const errors = [];

  const page = parseIntParam(query.page, "page", { min: 1, fallback: 1 }, errors);
  const limit = parseIntParam(
    query.limit,
    "limit",
    { min: 1, max: MAX_PAGE_SIZE, fallback: DEFAULT_PAGE_SIZE },
    errors,
  );
  const status = collectStatus(query.status, errors);
  const accountManager = collectAccountManager(query.accountManager, errors);

  let search;
  if (query.search !== undefined && query.search !== null && query.search !== "") {
    if (!isString(query.search)) {
      errors.push({ field: "search", message: "search must be a string" });
    } else {
      search = query.search.trim();
    }
  }

  if (errors.length) {
    throw HttpError.badRequest("Validation failed", errors);
  }
  return { page, limit, status, accountManager, search };
};
