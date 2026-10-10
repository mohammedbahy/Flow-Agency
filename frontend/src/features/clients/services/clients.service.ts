import { apiClient } from '../../../core/api/api-client';
import type { ApiEnvelope, ApiPagination } from '../../../core/api/types';

export type BackendClientStatus = 'active' | 'inactive';

export interface ApiClient {
  id: string;
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  status: BackendClientStatus;
  notes: string | null;
  accountManager: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientBody {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  status?: BackendClientStatus;
}

/** Clients API — Express backend (`/api/v1/clients`, admin only). */
export const clientsService = {
  list(query: { page?: number; limit?: number; search?: string } = {}): Promise<{
    data: ApiClient[];
    pagination: ApiPagination;
  }> {
    return apiClient
      .get<ApiEnvelope<ApiClient[]>, typeof query>('/clients', query)
      .then((res) => ({ data: res.data, pagination: res.pagination! }));
  },

  create(body: CreateClientBody): Promise<ApiClient> {
    return apiClient.post<ApiEnvelope<ApiClient>, CreateClientBody>('/clients', body).then((res) => res.data);
  },

  update(clientId: string, body: Partial<CreateClientBody>): Promise<ApiClient> {
    return apiClient
      .patch<ApiEnvelope<ApiClient>, Partial<CreateClientBody>>(`/clients/${clientId}`, body)
      .then((res) => res.data);
  },
};

export default clientsService;
