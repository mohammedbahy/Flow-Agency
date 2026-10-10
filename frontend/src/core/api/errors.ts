import axios from 'axios';

/**
 * Extracts a human-readable message from any request failure.
 * Backend errors use `{ success: false, message }`; network failures
 * fall back to a generic notice.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (error.code === 'ECONNABORTED') return 'The request timed out. Please try again.';
    if (!error.response) return 'Cannot reach the server. Is the backend running?';
    if (error.response.status === 423) return 'Account temporarily locked. Try again later.';
    return `Request failed (${error.response.status}).`;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

/** True when the failure is an expired/invalid session (backend 401). */
export function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}
