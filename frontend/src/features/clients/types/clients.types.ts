import type { BackendClientStatus } from '../services/clients.service';

export type ClientStatus = BackendClientStatus;

export interface ClientRow {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  status: ClientStatus;
  createdAt: string;
}

export interface ClientFormValues {
  name: string;
  email: string;
  phone: string;
  description: string;
  status: ClientStatus;
}

export interface ClientFormErrors {
  name?: string;
  email?: string;
}

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
};

export function validateClientForm(values: ClientFormValues): ClientFormErrors {
  const errors: ClientFormErrors = {};
  if (!values.name.trim()) errors.name = 'Client name is required.';
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  return errors;
}
