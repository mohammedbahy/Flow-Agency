import { apiClient } from '../../../core/api/api-client';
import type { ApiEnvelope } from '../../../core/api/types';
import type { StoredUser } from '../../../core/auth/token-storage';

export interface LoginResponse {
  token: string;
  user: StoredUser;
}

export interface MyPermissions {
  role: string;
  permissions: string[];
}

/** Real authentication service — Express backend (`/api/v1/auth`, `/permissions`). */
export const authService = {
  login(email: string, password: string): Promise<LoginResponse> {
    return apiClient
      .post<ApiEnvelope<LoginResponse>, { email: string; password: string }>('/auth/login', {
        email,
        password,
      })
      .then((res) => res.data);
  },

  changePassword(currentPassword: string, newPassword: string): Promise<string> {
    return apiClient
      .patch<ApiEnvelope<unknown>, { currentPassword: string; newPassword: string }>(
        '/auth/change-password',
        { currentPassword, newPassword },
      )
      .then((res) => res.message ?? 'Password changed successfully.');
  },

  myPermissions(): Promise<MyPermissions> {
    return apiClient.get<ApiEnvelope<MyPermissions>>('/permissions/me').then((res) => res.data);
  },

  permissionsMatrix(): Promise<{ role: string; permissions: string[] }[]> {
    return apiClient
      .get<ApiEnvelope<{ role: string; permissions: string[] }[]>>('/permissions/matrix')
      .then((res) => res.data);
  },
};

export default authService;
