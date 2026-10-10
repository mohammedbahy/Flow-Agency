import * as clientService from "../services/client-service.js";
import {
  validateCreateClientPayload,
  validateListClientsQuery,
  validateUpdateClientPayload,
} from "../validators/client-validator.js";

export const createClient = async (req, res) => {
  const payload = validateCreateClientPayload(req.body);
  const client = await clientService.createClient(payload, req.user);

  res.status(201).json({
    success: true,
    message: "Client created successfully",
    data: client,
  });
};

export const listClients = async (req, res) => {
  const query = validateListClientsQuery(req.query);
  const { items, pagination } = await clientService.listClients(query);

  res.status(200).json({
    success: true,
    data: items,
    pagination,
  });
};

export const getClientById = async (req, res) => {
  const client = await clientService.getClientDetail(
    req.params.clientId,
    req.user,
  );

  res.status(200).json({
    success: true,
    data: client,
  });
};

export const updateClient = async (req, res) => {
  const payload = validateUpdateClientPayload(req.body);
  const client = await clientService.updateClient(req.params.clientId, payload);

  res.status(200).json({
    success: true,
    message: "Client updated successfully",
    data: client,
  });
};
