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
  const { items, pagination } = await taskService.listTasks(query);

  res.status(200).json({
    success: true,
    data: items,
    pagination,
  });
};

export const getTask = async (req, res) => {
  const task = await taskService.getTaskDetail(req.params.taskId);

  res.status(200).json({
    success: true,
    data: task,
  });
};

export const updateTask = async (req, res) => {
  const payload = validateUpdateTaskPayload(req.body);
  const task = await taskService.updateTask(req.params.taskId, payload);

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: task,
  });
};

export const deleteTask = async (req, res) => {
  await taskService.deleteTask(req.params.taskId);

  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
};
