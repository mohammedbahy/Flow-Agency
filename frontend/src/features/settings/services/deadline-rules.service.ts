import { apiClient } from '../../../core/api/api-client';
import type { ApiEnvelope } from '../../../core/api/types';

export type DeadlineTaskType = 'design' | 'content' | 'development' | 'video' | 'seo' | 'other';
export type DeadlineUnit = 'hours' | 'days';
export type DeadlineDirection = 'before' | 'after';

export interface ApiDeadlineRule {
  id: string;
  taskType: DeadlineTaskType;
  offsetValue: number;
  offsetUnit: DeadlineUnit;
  direction: DeadlineDirection;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DeadlineRuleBody {
  taskType: DeadlineTaskType;
  offsetValue: number;
  offsetUnit: DeadlineUnit;
  direction: DeadlineDirection;
  active?: boolean;
}

/** Deadline Rules API — Express backend (`/api/v1/deadline-rules`). */
export const deadlineRulesService = {
  list(): Promise<ApiDeadlineRule[]> {
    return apiClient.get<ApiEnvelope<ApiDeadlineRule[]>>('/deadline-rules').then((res) => res.data);
  },

  create(body: DeadlineRuleBody): Promise<ApiDeadlineRule> {
    return apiClient
      .post<ApiEnvelope<ApiDeadlineRule>, DeadlineRuleBody>('/deadline-rules', body)
      .then((res) => res.data);
  },

  update(ruleId: string, body: Partial<DeadlineRuleBody>): Promise<ApiDeadlineRule> {
    return apiClient
      .patch<ApiEnvelope<ApiDeadlineRule>, Partial<DeadlineRuleBody>>(`/deadline-rules/${ruleId}`, body)
      .then((res) => res.data);
  },

  remove(ruleId: string): Promise<void> {
    return apiClient.delete<ApiEnvelope<unknown>>(`/deadline-rules/${ruleId}`).then(() => undefined);
  },
};

export default deadlineRulesService;
