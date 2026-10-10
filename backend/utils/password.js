import HttpError from "./http-error.js";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72; // bcrypt input limit

const PASSWORD_RULES = [
  {
    test: (value) => value.length >= PASSWORD_MIN_LENGTH,
    message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  },
  {
    test: (value) => value.length <= PASSWORD_MAX_LENGTH,
    message: `Password must be at most ${PASSWORD_MAX_LENGTH} characters`,
  },
  {
    test: (value) => /[a-z]/.test(value),
    message: "Password must contain a lowercase letter",
  },
  {
    test: (value) => /[A-Z]/.test(value),
    message: "Password must contain an uppercase letter",
  },
  {
    test: (value) => /\d/.test(value),
    message: "Password must contain a digit",
  },
  {
    test: (value) => /[^A-Za-z0-9]/.test(value),
    message: "Password must contain a special character",
  },
];

/** Returns a list of `{ field, message }` violations (empty when strong). */
export const getPasswordErrors = (password, field = "password") => {
  if (typeof password !== "string" || password.length === 0) {
    return [{ field, message: `${field} is required` }];
  }
  return PASSWORD_RULES.filter((rule) => !rule.test(password)).map((rule) => ({
    field,
    message: rule.message,
  }));
};

export const isStrongPassword = (password) =>
  getPasswordErrors(password).length === 0;

/** Throws a 400 with a field-level error list when the password is weak. */
export const assertStrongPassword = (password, field = "password") => {
  const errors = getPasswordErrors(password, field);
  if (errors.length) {
    throw HttpError.badRequest("Validation failed", errors);
  }
};
