import * as deadlineRuleService from "../services/deadline-rule-service.js";
import {
  validateCreateDeadlineRulePayload,
  validateListDeadlineRulesQuery,
  validateUpdateDeadlineRulePayload,
} from "../validators/deadline-rule-validator.js";

export const createDeadlineRule = async (req, res) => {
  const payload = validateCreateDeadlineRulePayload(req.body);
  const rule = await deadlineRuleService.createDeadlineRule(payload, req.user);

  res.status(201).json({
    success: true,
    message: "Deadline rule created successfully",
    data: rule,
  });
};

export const listDeadlineRules = async (req, res) => {
  const query = validateListDeadlineRulesQuery(req.query);
  const rules = await deadlineRuleService.listDeadlineRules(query);

  res.status(200).json({
    success: true,
    data: rules,
  });
};

export const getDeadlineRule = async (req, res) => {
  const rule = await deadlineRuleService.getDeadlineRuleDetail(
    req.params.ruleId,
  );

  res.status(200).json({
    success: true,
    data: rule,
  });
};

export const updateDeadlineRule = async (req, res) => {
  const payload = validateUpdateDeadlineRulePayload(req.body);
  const rule = await deadlineRuleService.updateDeadlineRule(
    req.params.ruleId,
    payload,
  );

  res.status(200).json({
    success: true,
    message: "Deadline rule updated successfully",
    data: rule,
  });
};

export const deleteDeadlineRule = async (req, res) => {
  await deadlineRuleService.deleteDeadlineRule(req.params.ruleId);

  res.status(200).json({
    success: true,
    message: "Deadline rule deleted successfully",
  });
};
