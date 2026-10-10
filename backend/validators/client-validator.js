import mongoose from "mongoose";
import HttpError from "../utils/http-error.js";

const CLIENT_STATUSES = ["active", "inactive"];
const WRITABLE_FIELDS = ["name", "description", "email", "phone", "accountManager", "status", "notes"];
const LIST_QUERY_FIELDS = ["search", "status", "accountManager", "page", "limit"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 100;
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

const validateName = (value, errors) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push({ field: "name", message: "name is required" });
    return undefined;
  }
  const name = value.trim();
  if (name.length < NAME_MIN_LENGTH || name.length > NAME_MAX_LENGTH) {
    errors.push({
      field: "name",
      message: `name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters`,
    });
    return undefined;
  }
  return name;
};

const validateOptionalText = (value, field, maxLength, errors) => {
  if (value === null) {
    return null;
  }
  if (typeof value !== "string") {
    errors.push({ field, message: `${field} must be a string` });
    return undefined;
  }
  const text = value.trim();
  if (text.length === 0) {
    return null;
  }
  if (text.length > maxLength) {
    errors.push({ field, message: `${field} must be at most ${maxLength} characters` });
    return undefined;
  }
  return text;
};

const validateEmail = (value, errors) => {
  if (value === null) {
    return null;
  }
  if (typeof value !== "string") {
    errors.push({ field: "email", message: "email must be a string" });
    return undefined;
  }
  const email = value.trim().toLowerCase();
  if (email.length === 0) {
    return null;
  }
  if (!EMAIL_PATTERN.test(email)) {
    errors.push({ field: "email", message: "email must be a valid email address" });
    return undefined;
  }
  return email;
};

const validateAccountManager = (value, errors) => {
  if (value === null || value === "") {
    return null;
  }
  if (typeof value !== "string" || !mongoose.isObjectIdOrHexString(value)) {
    errors.push({
      field: "accountManager",
      message: "accountManager must be a valid user id or null",
    });
    return undefined;
  }
  return value;
};

const validateClientPayload = (body, { partial }) => {
  const errors = [];
  collectUnknownFields(body, WRITABLE_FIELDS, errors);
  const payload = {};

  if (!partial || "name" in body) {
    const name = validateName(body.name, errors);
    if (name !== undefined) {
      payload.name = name;
    }
  }

  if ("description" in body) {
    const description = validateOptionalText(body.description, "description", TEXT_MAX_LENGTH, errors);
    if (description !== undefined) {
      payload.description = description;
    }
  }

  if ("email" in body) {
    const email = validateEmail(body.email, errors);
    if (email !== undefined) {
      payload.email = email;
    }
  }

  if ("phone" in body) {
    const phone = validateOptionalText(body.phone, "phone", TEXT_MAX_LENGTH, errors);
    if (phone !== undefined) {
      payload.phone = phone;
    }
  }

  if ("accountManager" in body) {
    const accountManager = validateAccountManager(body.accountManager, errors);
    if (accountManager !== undefined) {
      payload.accountManager = accountManager;
    }
  }

  if ("status" in body) {
    if (CLIENT_STATUSES.includes(body.status)) {
      payload.status = body.status;
    } else {
      errors.push({
        field: "status",
        message: `status must be one of: ${CLIENT_STATUSES.join(", ")}`,
      });
    }
  }

  if ("notes" in body) {
    const notes = validateOptionalText(body.notes, "notes", TEXT_MAX_LENGTH, errors);
    if (notes !== undefined) {
      payload.notes = notes;
    }
  }

  if (errors.length > 0) {
    throw HttpError.badRequest("Validation failed", errors);
  }

  if (partial && Object.keys(payload).length === 0) {
    throw HttpError.badRequest("Validation failed", [
      { field: "body", message: "At least one updatable field must be provided" },
    ]);
  }

  return payload;
};

export const validateCreateClientPayload = (body = {}) => validateClientPayload(body, { partial: false });

export const validateUpdateClientPayload = (body = {}) => validateClientPayload(body, { partial: true });

export const parsePositiveInt = (value, field, max, errors) => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    errors.push({ field, message: `${field} must be a positive integer` });
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > max) {
    errors.push({
      field,
      message: max === Number.POSITIVE_INFINITY ? `${field} must be a positive integer` : `${field} must be between 1 and ${max}`,
    });
    return undefined;
  }
  return parsed;
};

export const validateListClientsQuery = (query = {}) => {
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
    if (typeof query.status === "string" && CLIENT_STATUSES.includes(query.status)) {
      filter.status = query.status;
    } else {
      errors.push({ field: "status", message: `status must be one of: ${CLIENT_STATUSES.join(", ")}` });
    }
  }

  if ("accountManager" in query) {
    if (typeof query.accountManager === "string" && mongoose.isObjectIdOrHexString(query.accountManager)) {
      filter.accountManager = query.accountManager;
    } else {
      errors.push({ field: "accountManager", message: "accountManager must be a valid user id" });
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
