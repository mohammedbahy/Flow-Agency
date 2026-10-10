import { apiClient } from '../../../core/api/api-client';
import type { ApiEnvelope, ApiPagination } from '../../../core/api/types';

export type BackendRole = 'admin' | 'account_manager' | 'employee';
export type BackendUserStatus = 'active' | 'inactive';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: BackendRole;
  status: BackendUserStatus;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: BackendRole | '';
  status?: BackendUserStatus | '';
}

export interface CreateUserBody {
  name: string;
  email: string;
  role: BackendRole;
  password: string;
}

/** Users API — Express backend (`/api/v1/users`). */
export const usersService = {
  list(query: ListUsersQuery = {}): Promise<{ data: ApiUser[]; pagination: ApiPagination }> {
    return apiClient
      .get<ApiEnvelope<ApiUser[]>, ListUsersQuery>('/users', query)
      .then((res) => ({ data: res.data, pagination: res.pagination! }));
  },

  create(body: CreateUserBody): Promise<ApiUser> {
    return apiClient.post<ApiEnvelope<ApiUser>, CreateUserBody>('/users', body).then((res) => res.data);
  },

  update(userId: string, body: { name?: string; email?: string }): Promise<ApiUser> {
    return apiClient
      .patch<ApiEnvelope<ApiUser>, { name?: string; email?: string }>(`/users/${userId}`, body)
      .then((res) => res.data);
  },

  changeStatus(userId: string, status: BackendUserStatus): Promise<ApiUser> {
    return apiClient
      .patch<ApiEnvelope<ApiUser>, { status: BackendUserStatus }>(`/users/${userId}/status`, { status })
      .then((res) => res.data);
  },

  changeRole(userId: string, role: BackendRole): Promise<ApiUser> {
    return apiClient
      .patch<ApiEnvelope<ApiUser>, { role: BackendRole }>(`/users/${userId}/role`, { role })
      .then((res) => res.data);
  },
};

export default usersService;
