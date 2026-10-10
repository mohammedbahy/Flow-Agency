import * as reportService from "../services/report-service.js";
import {
  validateCompletionRateQuery,
  validateDelayedTasksQuery,
} from "../validators/report-validator.js";

export const getCompletionRate = async (req, res) => {
  const query = validateCompletionRateQuery(req.query);
  const report = await reportService.getCompletionRate(query);

  res.status(200).json({
    success: true,
    data: report,
  });
};

export const getDelayedTasks = async (req, res) => {
  const query = validateDelayedTasksQuery(req.query);
  const { items, pagination } = await reportService.getDelayedTasks(query);

  res.status(200).json({
    success: true,
    data: items,
    pagination,
  });
};
