import DeadlineRule from "../models/deadline-rule.js";
import HttpError from "../utils/http-error.js";
import { assertValidObjectId } from "../utils/object-id.js";

export const formatDeadlineRule = (rule) => ({
  id: String(rule._id),
  taskType: rule.taskType,
  offsetValue: rule.offsetValue,
  offsetUnit: rule.offsetUnit,
  direction: rule.direction,
  active: rule.active,
  createdBy: rule.createdBy ? String(rule.createdBy) : null,
  createdAt: rule.createdAt,
  updatedAt: rule.updatedAt,
});

const findRuleOrThrow = async (ruleId) => {
  assertValidObjectId(ruleId, "rule id");
  const rule = await DeadlineRule.findById(ruleId);
  if (!rule) {
    throw HttpError.notFound("Deadline rule not found");
  }
  return rule;
};

const assertTaskTypeAvailable = async (taskType, excludeRuleId = null) => {
  const filter = { taskType };
  if (excludeRuleId) {
    filter._id = { $ne: excludeRuleId };
  }
  const existing = await DeadlineRule.findOne(filter).select("_id");
  if (existing) {
    throw HttpError.conflict(
      `A deadline rule for task type '${taskType}' already exists`,
    );
  }
};

export const createDeadlineRule = async (payload, actor) => {
  await assertTaskTypeAvailable(payload.taskType);

  const rule = await DeadlineRule.create({
    taskType: payload.taskType,
    offsetValue: payload.offsetValue,
    offsetUnit: payload.offsetUnit,
    direction: payload.direction,
    active: payload.active ?? true,
    createdBy: actor?._id ?? null,
  });

  return formatDeadlineRule(rule);
};

export const listDeadlineRules = async ({ active, taskType }) => {
  const filter = {};
  if (active !== undefined) {
    filter.active = active;
  }
  if (taskType) {
    filter.taskType = taskType;
  }

  const rules = await DeadlineRule.find(filter).sort({ taskType: 1 });
  return rules.map(formatDeadlineRule);
};

export const getDeadlineRuleDetail = async (ruleId) =>
  formatDeadlineRule(await findRuleOrThrow(ruleId));

export const updateDeadlineRule = async (ruleId, payload) => {
  const rule = await findRuleOrThrow(ruleId);

  if (payload.taskType !== undefined && payload.taskType !== rule.taskType) {
    await assertTaskTypeAvailable(payload.taskType, rule._id);
    rule.taskType = payload.taskType;
  }
  if (payload.offsetValue !== undefined) {
    rule.offsetValue = payload.offsetValue;
  }
  if (payload.offsetUnit !== undefined) {
    rule.offsetUnit = payload.offsetUnit;
  }
  if (payload.direction !== undefined) {
    rule.direction = payload.direction;
  }
  if (payload.active !== undefined) {
    rule.active = payload.active;
  }

  await rule.save();
  return formatDeadlineRule(rule);
};

export const deleteDeadlineRule = async (ruleId) => {
  await findRuleOrThrow(ruleId);
  await DeadlineRule.deleteOne({ _id: ruleId });
};

/**
 * Used by task management (FLW-227). Returns lean rule objects ready to feed
 * into the pure `calculateDeadline(taskType, publishingDate, rules)`.
 */
export const getActiveRules = async () =>
  DeadlineRule.find({ active: true }).lean();
