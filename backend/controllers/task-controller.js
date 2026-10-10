import * as taskService from "../services/task-service.js";
import {
  validateCreateTaskPayload,
  validateListTasksQuery,
  validateUpdateTaskPayload,
} from "../validators/task-validator.js";

export const createTask = async (req, res) => {
  const payload = validateCreateTaskPayload(req.body);
  const task = await taskService.createTask(payload, req.user);

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: task,
  });
};

export const listTasks = async (req, res) => {
  const query = validateListTasksQuery(req.query);
  const { items, pagination } = await taskService.listTasks(query, req.user);

  res.status(200).json({
    success: true,
    data: items,
    pagination,
  });
};

export const updateTask = async (req, res) => {
  const payload = validateUpdateTaskPayload(req.body);
  const task = await taskService.updateTask(req.params.taskId, payload, req.user);

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: task,
  });
};
