import axios, { type AxiosInstance } from 'axios';
import { getAccessToken } from '../auth/token-storage';

/**
 * Centralized Axios instance. All feature services must use this —
 * components never call axios/fetch directly.
 *
 * - Base URL comes from `VITE_API_BASE_URL` (Express `/api/v1` backend).
 * - The request interceptor attaches `Authorization: Bearer <token>`.
 * - The response interceptor clears a dead session on 401 so the auth
 *   layer can redirect to /login (prevents authenticated-looking UI
 *   with an expired token).
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Expired/invalid token: drop it and bounce to login.
      // Skip when the failing call IS the login attempt itself.
      const url = error.config?.url ?? '';
      if (!url.includes('/auth/login')) {
        window.dispatchEvent(new CustomEvent('agencyos:unauthorized'));
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
