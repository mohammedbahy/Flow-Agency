const TOKEN_KEY = 'agencyos.token';
const USER_KEY = 'agencyos.user';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
}

/** In-memory fallback when Web Storage is unavailable (e.g. some test envs). */
const memoryFallback = new Map<string, string>();

function webStorage(persistent: boolean): Storage | null {
  try {
    const store = persistent ? window.localStorage : window.sessionStorage;
    if (!store) return null;
    // Probe: throws in locked-down contexts (private mode, some jsdom).
    store.setItem('__agencyos_probe__', '1');
    store.removeItem('__agencyos_probe__');
    return store;
  } catch {
    return null;
  }
}

function read(key: string): string | null {
  return webStorage(true)?.getItem(key) ?? webStorage(false)?.getItem(key) ?? memoryFallback.get(key) ?? null;
}

/** Reads the token from either storage (login with "remember me" persists). */
export function getAccessToken(): string | null {
  return read(TOKEN_KEY);
}

export function saveSession(token: string, user: StoredUser, persistent: boolean): void {
  clearSession();
  const store = webStorage(persistent);
  if (store) {
    store.setItem(TOKEN_KEY, token);
    store.setItem(USER_KEY, JSON.stringify(user));
  } else {
    memoryFallback.set(TOKEN_KEY, token);
    memoryFallback.set(USER_KEY, JSON.stringify(user));
  }
}

export function getStoredUser(): StoredUser | null {
  const raw = read(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  webStorage(true)?.removeItem(TOKEN_KEY);
  webStorage(true)?.removeItem(USER_KEY);
  webStorage(false)?.removeItem(TOKEN_KEY);
  webStorage(false)?.removeItem(USER_KEY);
  memoryFallback.clear();
}
