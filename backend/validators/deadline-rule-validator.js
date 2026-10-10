import {
  DIRECTION_VALUES,
  OFFSET_UNIT_VALUES,
} from "../constants/deadline.js";
import { TASK_TYPES } from "../constants/task-types.js";
import {
  collectBoolean,
  collectEnum,
  parseIntValue,
  throwIfErrors,
} from "../utils/validation.js";

export const validateCreateDeadlineRulePayload = (body = {}) => {
  const errors = [];

  const taskType = collectEnum(body.taskType, "taskType", TASK_TYPES, errors, {
    required: true,
  });
  const offsetValue = parseIntValue(
    body.offsetValue,
    "offsetValue",
    { min: 0 },
    errors,
  );
  const offsetUnit = collectEnum(
    body.offsetUnit,
    "offsetUnit",
    OFFSET_UNIT_VALUES,
    errors,
    { required: true },
  );
  const direction = collectEnum(
    body.direction,
    "direction",
    DIRECTION_VALUES,
    errors,
    { required: true },
  );
  const active = collectBoolean(body.active, "active", errors);

  throwIfErrors(errors);
  return { taskType, offsetValue, offsetUnit, direction, active };
};

export const validateUpdateDeadlineRulePayload = (body = {}) => {
  const errors = [];
  const fields = ["taskType", "offsetValue", "offsetUnit", "direction", "active"];

  if (!fields.some((field) => body[field] !== undefined)) {
    errors.push({
      field: "body",
      message: `At least one of ${fields.join(", ")} must be provided`,
    });
  }

  const taskType = collectEnum(body.taskType, "taskType", TASK_TYPES, errors);
  const offsetValue =
    body.offsetValue === undefined
      ? undefined
      : parseIntValue(body.offsetValue, "offsetValue", { min: 0 }, errors);
  const offsetUnit = collectEnum(
    body.offsetUnit,
    "offsetUnit",
    OFFSET_UNIT_VALUES,
    errors,
  );
  const direction = collectEnum(
    body.direction,
    "direction",
    DIRECTION_VALUES,
    errors,
  );
  const active = collectBoolean(body.active, "active", errors);

  throwIfErrors(errors);
  return { taskType, offsetValue, offsetUnit, direction, active };
};

export const validateListDeadlineRulesQuery = (query = {}) => {
  const errors = [];
  let active;
  if (query.active !== undefined && query.active !== "") {
    if (query.active === "true") {
      active = true;
    } else if (query.active === "false") {
      active = false;
    } else {
      errors.push({
        field: "active",
        message: "active must be either true or false",
      });
    }
  }
  const taskType = collectEnum(query.taskType, "taskType", TASK_TYPES, errors);

  throwIfErrors(errors);
  return { active, taskType };
};
