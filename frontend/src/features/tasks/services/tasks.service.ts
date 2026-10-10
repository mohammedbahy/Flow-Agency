import { apiClient } from '../../../core/api/api-client';
import type { ApiEnvelope, ApiPagination } from '../../../core/api/types';

export type BackendTaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface ApiTask {
  id: string;
  title: string | null;
  taskType: string;
  status: BackendTaskStatus;
  publishingDate: string | null;
  deadline: string | null;
  deadlineOverridden: boolean;
  assignee: string | null;
  client: string | null;
  team: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DelayedTaskItem {
  id: string;
  title: string | null;
  taskType: string;
  status: BackendTaskStatus;
  publishingDate: string | null;
  deadline: string;
  daysOverdue: number;
  assignee: { id: string; name: string | null; email: string | null } | null;
  client: { id: string; name: string | null } | null;
  team: { id: string; name: string | null } | null;
}

export interface CompletionRate {
  total: number;
  completed: number;
  notCompleted: number;
  rate: number;
}

/** Tasks + Reports API — Express backend (`/api/v1/tasks`, `/api/v1/reports`). */
export const tasksService = {
  list(query: { page?: number; limit?: number; status?: BackendTaskStatus; taskType?: string } = {}): Promise<{
    data: ApiTask[];
    pagination: ApiPagination;
  }> {
    return apiClient
      .get<ApiEnvelope<ApiTask[]>, typeof query>('/tasks', query)
      .then((res) => ({ data: res.data, pagination: res.pagination! }));
  },

  delayed(query: { page?: number; limit?: number } = {}): Promise<{
    items: DelayedTaskItem[];
    pagination: ApiPagination;
  }> {
    // Report envelope nests the payload under data: { items, pagination }.
    return apiClient
      .get<ApiEnvelope<{ items: DelayedTaskItem[]; pagination: ApiPagination }>, typeof query>(
        '/reports/delayed-tasks',
        query,
      )
      .then((res) => res.data);
  },

  completionRate(): Promise<CompletionRate> {
    return apiClient
      .get<ApiEnvelope<CompletionRate>>('/reports/completion-rate')
      .then((res) => res.data);
  },
};

export default tasksService;
