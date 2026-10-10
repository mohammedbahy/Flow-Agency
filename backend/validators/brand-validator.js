import mongoose from "mongoose";
import HttpError from "../utils/http-error.js";
import { parsePositiveInt } from "./client-validator.js";

export const BRAND_STATUSES = ["active", "inactive"];

const CREATE_FIELDS = ["name", "description", "client", "status"];
const LIST_QUERY_FIELDS = ["search", "status", "page", "limit"];

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

const validateClientRef = (value, errors) => {
  if (typeof value !== "string" || !mongoose.isObjectIdOrHexString(value)) {
    errors.push({ field: "client", message: "client must be a valid id" });
    return undefined;
  }
  return value;
};

const validateStatus = (value, errors) => {
  if (BRAND_STATUSES.includes(value)) {
    return value;
  }
  errors.push({ field: "status", message: `status must be one of: ${BRAND_STATUSES.join(", ")}` });
  return undefined;
};

export const validateCreateBrandPayload = (body = {}) => {
  const errors = [];
  collectUnknownFields(body, CREATE_FIELDS, errors);
  const payload = {};

  const name = validateName(body.name, errors);
  if (name !== undefined) {
    payload.name = name;
  }

  if ("description" in body) {
    const description = validateDescription(body.description, errors);
    if (description !== undefined) {
      payload.description = description;
    }
  }

  const client = validateClientRef(body.client, errors);
  if (client !== undefined) {
    payload.client = client;
  }

  if ("status" in body) {
    const status = validateStatus(body.status, errors);
    if (status !== undefined) {
      payload.status = status;
    }
  }

  if (errors.length > 0) {
    throw HttpError.badRequest("Validation failed", errors);
  }

  return payload;
};

export const validateListBrandsQuery = (query = {}) => {
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
    if (typeof query.status === "string" && BRAND_STATUSES.includes(query.status)) {
      filter.status = query.status;
    } else {
      errors.push({ field: "status", message: `status must be one of: ${BRAND_STATUSES.join(", ")}` });
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
