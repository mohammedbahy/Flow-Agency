export type ClientStatus = 'active' | 'at-risk' | 'paused';

export interface MockClient {
  id: string;
  name: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  brands: string[];
  activeProjects: number;
  status: ClientStatus;
}

export interface ClientFormValues {
  name: string;
  industry: string;
  contactName: string;
  contactEmail: string;
  status: ClientStatus;
}

export interface ClientFormErrors {
  name?: string;
  contactEmail?: string;
}

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  active: 'Active',
  'at-risk': 'At risk',
  paused: 'Paused',
};

export function validateClientForm(values: ClientFormValues): ClientFormErrors {
  const errors: ClientFormErrors = {};
  if (!values.name.trim()) errors.name = 'Client name is required.';
  if (!values.contactEmail.trim()) {
    errors.contactEmail = 'Contact email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail.trim())) {
    errors.contactEmail = 'Enter a valid email address.';
  }
  return errors;
}
