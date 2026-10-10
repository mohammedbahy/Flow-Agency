import { apiClient } from '../../../core/api/api-client';
import type { ApiEnvelope, ApiPagination } from '../../../core/api/types';

export interface ApiTeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ApiTeam {
  id: string;
  name: string;
  description: string | null;
  status: 'active' | 'inactive';
  memberCount: number;
  members?: ApiTeamMember[];
  createdAt: string;
  updatedAt: string;
}

/** Teams API — Express backend (`/api/v1/teams`). */
export const teamsService = {
  list(query: { page?: number; limit?: number; search?: string } = {}): Promise<{
    data: ApiTeam[];
    pagination: ApiPagination;
  }> {
    return apiClient
      .get<ApiEnvelope<ApiTeam[]>, typeof query>('/teams', query)
      .then((res) => ({ data: res.data, pagination: res.pagination! }));
  },

  get(teamId: string): Promise<ApiTeam> {
    return apiClient.get<ApiEnvelope<ApiTeam>>(`/teams/${teamId}`).then((res) => res.data);
  },

  create(body: { name: string; description?: string }): Promise<ApiTeam> {
    return apiClient
      .post<ApiEnvelope<ApiTeam>, { name: string; description?: string }>('/teams', body)
      .then((res) => res.data);
  },

  addMembers(teamId: string, userIds: string[]): Promise<ApiTeam> {    return apiClient
      .post<ApiEnvelope<ApiTeam>, { userIds: string[] }>(`/teams/${teamId}/members`, { userIds })
      .then((res) => res.data);
  },

  removeMember(teamId: string, userId: string): Promise<ApiTeam> {
    return apiClient
      .delete<ApiEnvelope<ApiTeam>>(`/teams/${teamId}/members/${userId}`)
      .then((res) => res.data);
  },

  deleteTeam(teamId: string): Promise<void> {
    return apiClient.delete<ApiEnvelope<unknown>>(`/teams/${teamId}`).then(() => undefined);
  },
};

export default teamsService;
