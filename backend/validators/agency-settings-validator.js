import HttpError from "../utils/http-error.js";

const UPDATE_FIELDS = ["name", "email", "phone", "address"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 100;
const TEXT_MAX_LENGTH = 2000;

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

const validateOptionalText = (value, field, errors) => {
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
  if (text.length > TEXT_MAX_LENGTH) {
    errors.push({ field, message: `${field} must be at most ${TEXT_MAX_LENGTH} characters` });
    return undefined;
  }
  return text;
};

export const validateUpdateAgencySettingsPayload = (body = {}) => {
  const errors = [];
  collectUnknownFields(body, UPDATE_FIELDS, errors);
  const payload = {};

  if (Object.keys(body).length === 0) {
    errors.push({ field: "body", message: "At least one updatable field must be provided" });
  }

  if ("name" in body) {
    const name = validateName(body.name, errors);
    if (name !== undefined) {
      payload.name = name;
    }
  }

  if ("email" in body) {
    const email = validateEmail(body.email, errors);
    if (email !== undefined) {
      payload.email = email;
    }
  }

  if ("phone" in body) {
    const phone = validateOptionalText(body.phone, "phone", errors);
    if (phone !== undefined) {
      payload.phone = phone;
    }
  }

  if ("address" in body) {
    const address = validateOptionalText(body.address, "address", errors);
    if (address !== undefined) {
      payload.address = address;
    }
  }

  if (errors.length > 0) {
    throw HttpError.badRequest("Validation failed", errors);
  }

  return payload;
};
