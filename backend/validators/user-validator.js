import { ROLES } from "../constants/roles.js";
import { assertStrongPassword } from "../utils/password.js";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from "../utils/pagination.js";
import {
  collectEmail,
  collectEnum,
  collectOptionalString,
  collectRequiredString,
  parseIntParam,
  throwIfErrors,
} from "../utils/validation.js";

// Admins are seeded, never created through the API (FLW-164).
const CREATABLE_ROLES = [ROLES.ACCOUNT_MANAGER, ROLES.EMPLOYEE];
const ALL_ROLES = Object.values(ROLES);
const USER_STATUSES = ["active", "inactive"];

export const validateCreateUserPayload = (body = {}) => {
  const errors = [];

  const name = collectRequiredString(
    body.name,
    "name",
    { min: 2, max: 100 },
    errors,
  );
  const email = collectEmail(body.email, "email", errors, { required: true });
  const role = collectEnum(body.role, "role", CREATABLE_ROLES, errors, {
    required: true,
  });

  const password = collectRequiredString(
    body.password,
    "password",
    { min: 1, max: 200 },
    errors,
  );
  if (password !== undefined) {
    try {
      assertStrongPassword(password, "password");
    } catch (error) {
      errors.push(...(error.errors ?? []));
    }
  }

  throwIfErrors(errors);
  return { name, email, role, password };
};

export const validateUpdateUserPayload = (body = {}) => {
  const errors = [];

  if (body.name === undefined && body.email === undefined) {
    errors.push({
      field: "body",
      message: "At least one of name or email must be provided",
    });
  }

  const name =
    body.name === undefined
      ? undefined
      : collectRequiredString(body.name, "name", { min: 2, max: 100 }, errors);
  const email = collectEmail(body.email, "email", errors);

  throwIfErrors(errors);
  return { name, email };
};

export const validateListUsersQuery = (query = {}) => {
  const errors = [];

  const page = parseIntParam(
    query.page,
    "page",
    { min: 1, fallback: 1 },
    errors,
  );
  const limit = parseIntParam(
    query.limit,
    "limit",
    { min: 1, max: MAX_PAGE_SIZE, fallback: DEFAULT_PAGE_SIZE },
    errors,
  );
  const search = collectOptionalString(
    query.search,
    "search",
    { max: 100 },
    errors,
  );
  const role = collectEnum(query.role, "role", ALL_ROLES, errors);
  const status = collectEnum(query.status, "status", USER_STATUSES, errors);

  throwIfErrors(errors);
  return { page, limit, search, role, status };
};

export const validateChangeRolePayload = (body = {}) => {
  const errors = [];
  const role = collectEnum(body.role, "role", ALL_ROLES, errors, {
    required: true,
  });
  throwIfErrors(errors);
  return { role };
};

export const validateChangeStatusPayload = (body = {}) => {
  const errors = [];
  const status = collectEnum(body.status, "status", USER_STATUSES, errors, {
    required: true,
  });
  throwIfErrors(errors);
  return { status };
};
