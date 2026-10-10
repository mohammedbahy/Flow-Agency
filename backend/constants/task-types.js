/**
 * Task types a deadline rule can be configured for (FLW-226). Kept as a fixed
 * catalogue so validation, the model enum, and the deadline calculator all
 * agree on the allowed values.
 */
export const TASK_TYPES = Object.freeze([
  "design",
  "content",
  "development",
  "video",
  "seo",
  "other",
]);
