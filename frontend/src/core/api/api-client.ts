import { axiosInstance } from './axios';

/**
 * Thin typed wrapper around the shared Axios instance so feature
 * services share one call style (`apiClient.get<T>(…)`).
 */
export const apiClient = {
  get: <T>(url: string, params?: unknown) =>
    axiosInstance.get<T>(url, { params }).then((r) => r.data),
  post: <T, B = unknown>(url: string, body?: B) =>
    axiosInstance.post<T>(url, body).then((r) => r.data),
  put: <T, B = unknown>(url: string, body?: B) =>
    axiosInstance.put<T>(url, body).then((r) => r.data),
  patch: <T, B = unknown>(url: string, body?: B) =>
    axiosInstance.patch<T>(url, body).then((r) => r.data),
  delete: <T>(url: string) =>
    axiosInstance.delete<T>(url).then((r) => r.data),
};

export default apiClient;
