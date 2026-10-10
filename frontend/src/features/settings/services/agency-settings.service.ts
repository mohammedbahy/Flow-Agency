import { apiClient } from '../../../core/api/api-client';
import type { ApiEnvelope } from '../../../core/api/types';

export interface ApiAgencySettings {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AgencySettingsBody {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

/** Agency Settings API — Express backend (`/api/v1/agency-settings`, singleton). */
export const agencySettingsService = {
  get(): Promise<ApiAgencySettings> {
    return apiClient.get<ApiEnvelope<ApiAgencySettings>>('/agency-settings').then((res) => res.data);
  },

  update(body: AgencySettingsBody): Promise<ApiAgencySettings> {
    return apiClient
      .patch<ApiEnvelope<ApiAgencySettings>, AgencySettingsBody>('/agency-settings', body)
      .then((res) => res.data);
  },
};

export default agencySettingsService;
