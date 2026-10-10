import HttpError from "./http-error.js";
import { assertValidObjectId } from "./object-id.js";

export const isString = (value) => typeof value === "string";
export const isNonEmpty = (value) =>
  value !== undefined && value !== null && value !== "";
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const collectRequiredString = (
  value,
  field,
  { min = 1, max = 255 } = {},
  errors,
) => {
  if (!isNonEmpty(value)) {
    errors.push({ field, message: `${field} is required` });
    return undefined;
  }
  if (!isString(value)) {
    errors.push({ field, message: `${field} must be a string` });
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    errors.push({
      field,
      message: `${field} must be between ${min} and ${max} characters`,
    });
  }
  return trimmed;
};

export const collectOptionalString = (
  value,
  field,
  { max = 255 } = {},
  errors,
) => {
  if (!isNonEmpty(value)) {
    return undefined;
  }
  if (!isString(value)) {
    errors.push({ field, message: `${field} must be a string` });
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return undefined;
  }
  if (max !== undefined && trimmed.length > max) {
    errors.push({
      field,
      message: `${field} must be at most ${max} characters`,
    });
  }
  return trimmed;
};

export const collectEmail = (
  value,
  field,
  errors,
  { required = false } = {},
) => {
  const trimmed = required
    ? collectRequiredString(value, field, { min: 3, max: 254 }, errors)
    : collectOptionalString(value, field, { max: 254 }, errors);

  if (trimmed !== undefined && !EMAIL_PATTERN.test(trimmed)) {
    errors.push({
      field,
      message: `${field} must be a valid email address`,
    });
  }
  return trimmed !== undefined ? trimmed.toLowerCase() : undefined;
};

export const collectEnum = (
  value,
  field,
  allowed,
  errors,
  { required = false } = {},
) => {
  if (!isNonEmpty(value)) {
    if (required) {
      errors.push({ field, message: `${field} is required` });
    }
    return undefined;
  }
  if (!allowed.includes(value)) {
    errors.push({
      field,
      message: `${field} must be one of: ${allowed.join(", ")}`,
    });
    return undefined;
  }
  return value;
};

export const collectBoolean = (value, field, errors) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "boolean") {
    errors.push({ field, message: `${field} must be a boolean` });
    return undefined;
  }
  return value;
};

export const collectObjectId = (
  value,
  field,
  errors,
  { required = false } = {},
) => {
  if (!isNonEmpty(value)) {
    if (required) {
      errors.push({ field, message: `${field} is required` });
    }
    return undefined;
  }
  try {
    assertValidObjectId(value, field);
  } catch {
    errors.push({ field, message: `${field} must be a valid id` });
    return undefined;
  }
  return value;
};

export const collectDate = (
  value,
  field,
  errors,
  { required = false } = {},
) => {
  if (!isNonEmpty(value)) {
    if (required) {
      errors.push({ field, message: `${field} is required` });
    }
    return undefined;
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    errors.push({ field, message: `${field} must be a valid date` });
    return undefined;
  }
  return date;
};

export const parseIntParam = (
  value,
  field,
  { min, max, fallback },
  errors,
) => {
  if (!isNonEmpty(value)) {
    return fallback;
  }
  const parsed = Number(value);
  if (
    !Number.isInteger(parsed) ||
    parsed < min ||
    (max !== undefined && parsed > max)
  ) {
    const bound =
      max === undefined ? `at least ${min}` : `between ${min} and ${max}`;
    errors.push({ field, message: `${field} must be an integer ${bound}` });
    return fallback;
  }
  return parsed;
};

export const parseIntValue = (value, field, { min, max }, errors) => {
  if (!isNonEmpty(value)) {
    errors.push({ field, message: `${field} is required` });
    return undefined;
  }
  const parsed = Number(value);
  if (
    !Number.isInteger(parsed) ||
    parsed < min ||
    (max !== undefined && parsed > max)
  ) {
    const bound =
      max === undefined ? `at least ${min}` : `between ${min} and ${max}`;
    errors.push({ field, message: `${field} must be an integer ${bound}` });
    return undefined;
  }
  return parsed;
};

/** Throws a single 400 error envelope carrying all field-level violations. */
export const throwIfErrors = (errors) => {
  if (errors.length) {
    throw HttpError.badRequest("Validation failed", errors);
  }
};

export { assertValidObjectId };
