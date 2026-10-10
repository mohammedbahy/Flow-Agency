import { apiClient } from '../../../core/api/api-client';
import type { ApiEnvelope, ApiPagination } from '../../../core/api/types';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type ReviewContentType = 'copy' | 'visual' | 'campaign';

export interface ApiReview {
  id: string;
  title: string;
  contentType: ReviewContentType;
  client: string | null;
  project: string | null;
  submittedBy: string | null;
  status: ReviewStatus;
  preview: string | null;
  feedback: string | null;
  decidedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewBody {
  title: string;
  contentType?: ReviewContentType;
  client?: string;
  project?: string;
  submittedBy?: string;
  preview?: string;
}

/** Reviews API — Express backend (`/api/v1/reviews`). */
export const reviewsService = {
  list(query: { status?: ReviewStatus; page?: number; limit?: number } = {}): Promise<{
    data: ApiReview[];
    pagination: ApiPagination;
  }> {
    return apiClient
      .get<ApiEnvelope<ApiReview[]>, typeof query>('/reviews', query)
      .then((res) => ({ data: res.data, pagination: res.pagination! }));
  },

  approve(reviewId: string): Promise<ApiReview> {
    return apiClient
      .patch<ApiEnvelope<ApiReview>, Record<string, never>>(`/reviews/${reviewId}/approve`, {})
      .then((res) => res.data);
  },

  reject(reviewId: string, feedback: string): Promise<ApiReview> {
    return apiClient
      .patch<ApiEnvelope<ApiReview>, { feedback: string }>(`/reviews/${reviewId}/reject`, { feedback })
      .then((res) => res.data);
  },
};

export default reviewsService;
