import { DIRECTIONS, MS_PER_UNIT } from "../constants/deadline.js";

const toDate = (value) => {
  if (value instanceof Date) {
    return value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

/**
 * Pure: applies a single deadline rule to a publishing date.
 * Returns a Date, or null when the inputs are unusable.
 */
export const applyDeadlineRule = (rule, publishingDate) => {
  if (!rule) {
    return null;
  }

  const base = toDate(publishingDate);
  if (!base) {
    return null;
  }

  const unitMs = MS_PER_UNIT[rule.offsetUnit];
  if (!unitMs || !Number.isFinite(rule.offsetValue)) {
    return null;
  }

  const delta = rule.offsetValue * unitMs;
  const ms =
    rule.direction === DIRECTIONS.AFTER
      ? base.getTime() + delta
      : base.getTime() - delta;

  return new Date(ms);
};

/**
 * Pure deadline calculator (FLW-226).
 *
 * `calculateDeadline(taskType, publishingDate, rules)` finds the *active* rule
 * for the task type and applies it. `rules` is injected so this stays pure and
 * unit-testable without a database; the service layer fetches the rules.
 *
 * @returns {Date|null}
 */
export const calculateDeadline = (taskType, publishingDate, rules = []) => {
  if (!taskType || !publishingDate) {
    return null;
  }

  const rule = rules.find(
    (candidate) =>
      candidate && candidate.taskType === taskType && candidate.active !== false,
  );

  if (!rule) {
    return null;
  }

  return applyDeadlineRule(rule, publishingDate);
};
