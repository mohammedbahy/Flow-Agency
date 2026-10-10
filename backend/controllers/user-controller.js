import * as userService from "../services/user-service.js";
import {
  validateChangeRolePayload,
  validateChangeStatusPayload,
  validateCreateUserPayload,
  validateListUsersQuery,
  validateUpdateUserPayload,
} from "../validators/user-validator.js";

export const createUser = async (req, res) => {
  const payload = validateCreateUserPayload(req.body);
  const user = await userService.createUser(payload, req.user);

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: user,
  });
};

export const listUsers = async (req, res) => {
  const query = validateListUsersQuery(req.query);
  const { items, pagination } = await userService.listUsers(query);

  res.status(200).json({
    success: true,
    data: items,
    pagination,
  });
};

export const getUser = async (req, res) => {
  const user = await userService.getUserDetail(req.params.userId);

  res.status(200).json({
    success: true,
    data: user,
  });
};

export const updateUser = async (req, res) => {
  const payload = validateUpdateUserPayload(req.body);
  const user = await userService.updateUser(req.params.userId, payload);

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
};

export const changeUserRole = async (req, res) => {
  const { role } = validateChangeRolePayload(req.body);
  const user = await userService.changeUserRole(req.params.userId, role);

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    data: user,
  });
};

export const changeUserStatus = async (req, res) => {
  const { status } = validateChangeStatusPayload(req.body);
  const user = await userService.setUserStatus(req.params.userId, status);

  res.status(200).json({
    success: true,
    message:
      status === "active"
        ? "User activated successfully"
        : "User deactivated successfully",
    data: user,
  });
};
