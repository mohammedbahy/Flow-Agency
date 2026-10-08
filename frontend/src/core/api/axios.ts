import axios, { type AxiosInstance } from 'axios';

/**
 * Centralized Axios instance. All feature services must use this —
 * components never call axios/fetch directly.
 *
 * Auth interceptors (token attach / 401 handling) arrive in Sprint 1.
 */
export const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
