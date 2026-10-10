import HttpError from "../utils/http-error.js";
import { assertValidObjectId } from "../utils/object-id.js";

const REVIEW_TYPES = ["copy", "visual", "campaign"];
const MAX_LIMIT = 100;

const collectUnknownFields = (source, allowedFields, errors) => {
  for (const key of Object.keys(source)) {
    if (!allowedFields.includes(key)) {
      errors.push({ field: key, message: `Unknown field: ${key}` });
    }
  }
};

const optionalText = (value, field, max, errors) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (typeof value !== "string") {
    errors.push({ field, message: `${field} must be a string` });
    return undefined;
  }
  const text = value.trim();
  if (text.length > max) {
    errors.push({ field, message: `${field} must be at most ${max} characters` });
    return undefined;
  }
  return text.length === 0 ? null : text;
};

export const validateCreateReviewPayload = (body = {}) => {
  const errors = [];
  collectUnknownFields(
    body,
    ["title", "contentType", "client", "project", "submittedBy", "preview"],
    errors,
  );
  const payload = {};

  if (typeof body.title !== "string" || body.title.trim().length < 2 || body.title.trim().length > 200) {
    errors.push({ field: "title", message: "title must be between 2 and 200 characters" });
  } else {
    payload.title = body.title.trim();
  }

  if ("contentType" in body) {
    if (!REVIEW_TYPES.includes(body.contentType)) {
      errors.push({ field: "contentType", message: `contentType must be one of: ${REVIEW_TYPES.join(", ")}` });
    } else {
      payload.contentType = body.contentType;
    }
  }

  for (const field of ["client", "project", "submittedBy"]) {
    if (field in body) {
      const value = optionalText(body[field], field, 100, errors);
      if (value !== undefined) {
        payload[field] = value;
      }
    }
  }

  if ("preview" in body) {
    const value = optionalText(body.preview, "preview", 5000, errors);
    if (value !== undefined) {
      payload.preview = value;
    }
  }

  if (errors.length > 0) {
    throw HttpError.badRequest("Validation failed", errors);
  }

  return payload;
};

export const validateRejectReviewPayload = (body = {}) => {
  const errors = [];
  collectUnknownFields(body, ["feedback"], errors);
  if (typeof body.feedback !== "string" || body.feedback.trim().length === 0) {
    errors.push({ field: "feedback", message: "feedback is required to send an item back" });
  } else if (body.feedback.trim().length > 2000) {
    errors.push({ field: "feedback", message: "feedback must be at most 2000 characters" });
  }
  if (errors.length > 0) {
    throw HttpError.badRequest("Validation failed", errors);
  }
  return { feedback: body.feedback.trim() };
};

export const validateListReviewsQuery = (query = {}) => {
  const errors = [];
  collectUnknownFields(query, ["status", "page", "limit"], errors);
  const filter = { page: 1, limit: 10 };
  if ("status" in query) {
    if (["pending", "approved", "rejected"].includes(query.status)) {
      filter.status = query.status;
    } else {
      errors.push({ field: "status", message: "status must be one of: pending, approved, rejected" });
    }
  }
  for (const key of ["page", "limit"]) {
    if (key in query) {
      const value = Number(query[key]);
      if (!Number.isInteger(value) || value < 1 || (key === "limit" && value > MAX_LIMIT)) {
        errors.push({ field: key, message: `${key} must be a positive integer` });
      } else {
        filter[key] = value;
      }
    }
  }
  if (errors.length > 0) {
    throw HttpError.badRequest("Validation failed", errors);
  }
  return filter;
};

export const validateReviewId = (value) => assertValidObjectId(value, "review id");
