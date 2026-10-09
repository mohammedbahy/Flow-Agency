import type { LoginFormValues, MockSignInResult } from '../types/auth.types';

/**
 * MOCK sign-in — UI preview only.
 * Simulates network latency, then reports that authentication is disabled.
 * It never contacts the backend, never creates a session, and never
 * stores a token. The Backend team replaces this with the real
 * `auth.service.ts` (Axios → /api/auth/*) during Sprint 1 integration.
 */
export async function mockSignIn(_values: LoginFormValues): Promise<MockSignInResult> {
  await new Promise((resolve) => setTimeout(resolve, 900));
  return {
    ok: false,
    message:
      'Demo mode — sign-in is disabled in this UI preview. No credentials were sent and no session was created.',
  };
}
