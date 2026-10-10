// Clients feature barrel — live backend (`/api/v1/clients`).
export { ClientsPage } from './pages/ClientsPage';
export { ClientDialog } from './components/ClientDialog';
export { clientsService } from './services/clients.service';
export { validateClientForm, CLIENT_STATUS_LABEL } from './types/clients.types';
export type {
  ApiClient,
  BackendClientStatus,
  CreateClientBody,
} from './services/clients.service';
export type {
  ClientRow,
  ClientStatus,
  ClientFormValues,
  ClientFormErrors,
} from './types/clients.types';
