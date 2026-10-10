import { apiClient } from '../../../core/api/api-client';
import type { ApiEnvelope, ApiPagination } from '../../../core/api/types';

export interface ApiBrand {
  id: string;
  name: string;
  description: string | null;
  client: { id: string; name: string } | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandMetrics {
  brand: { id: string; name: string };
  completionRate: number | null;
  averageCompletionTimeMs: number | null;
}

export interface BrandWorkflow {
  brand: ApiBrand;
  teams: { id: string; name: string }[];
  workflow: {
    totalTasks: number;
    byStatus: Record<string, number>;
  };
}

/** Brands API — Express backend (`/api/v1/brands`). */
export const brandsService = {
  list(query: { page?: number; limit?: number; search?: string } = {}): Promise<{
    data: ApiBrand[];
    pagination: ApiPagination;
  }> {
    return apiClient
      .get<ApiEnvelope<ApiBrand[]>, typeof query>('/brands', query)
      .then((res) => ({ data: res.data, pagination: res.pagination! }));
  },

  metrics(brandId: string): Promise<BrandMetrics> {
    return apiClient.get<ApiEnvelope<BrandMetrics>>(`/brands/${brandId}/metrics`).then((res) => res.data);
  },

  workflow(brandId: string): Promise<BrandWorkflow> {
    return apiClient.get<ApiEnvelope<BrandWorkflow>>(`/brands/${brandId}/workflow`).then((res) => res.data);
  },
};

export interface DashboardAggregate {
  clients: { total: number; active: number; inactive: number };
  tasks: {
    total: number;
    byStatus: Record<string, number>;
    completionRate: number;
    averageCompletionTimeMs: number | null;
  };
  teams: { total: number; active: number; byTeam: { id: string; name: string; taskCount: number }[] };
  brands: { total: number; active: number; inactive: number };
}

/** Dashboard aggregate API — Express backend (`/api/v1/dashboard`). */
export const dashboardService = {
  get(): Promise<DashboardAggregate> {
    return apiClient.get<ApiEnvelope<DashboardAggregate>>('/dashboard').then((res) => res.data);
  },
};

export default brandsService;
