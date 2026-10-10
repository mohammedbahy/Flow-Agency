/**
 * Backend envelope shapes (Express team contract):
 * success responses `{ success: true, message?, data, pagination? }`,
 * errors `{ success: false, message, errors? }`.
 */
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: ApiPagination;
}

export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiErrorBody {
  success: false;
  message?: string;
  errors?: { field?: string; message: string }[];
}
