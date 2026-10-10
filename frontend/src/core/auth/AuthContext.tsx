import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authService } from '../../features/authentication/services/auth.service';
import {
  clearSession,
  getStoredUser,
  saveSession,
  type StoredUser,
} from './token-storage';

interface AuthContextValue {
  user: StoredUser | null;
  permissions: string[];
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<StoredUser>;
  logout: () => void;
  refreshPermissions: () => Promise<void>;
  can: (permission: string) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  /** Test-only seam: skip session restore and seed auth state. */
  initialUser?: StoredUser | null;
  initialPermissions?: string[];
}

/**
 * Session provider: restores the stored JWT session on boot, exposes
 * login/logout, and bounces to /login when the API reports 401.
 */
export function AuthProvider({ children, initialUser, initialPermissions = [] }: AuthProviderProps) {
  const [user, setUser] = useState<StoredUser | null>(() =>
    initialUser !== undefined ? initialUser : getStoredUser(),
  );
  const [permissions, setPermissions] = useState<string[]>(initialPermissions);
  const [loading, setLoading] = useState(initialUser === undefined);

  // Navigation after logout is handled by <ProtectedRoute> (user becomes
  // null → bounce to /login), so this context stays router-independent.
  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setPermissions([]);
  }, []);

  useEffect(() => {
    if (initialUser !== undefined) return;
    // Verify the restored session and load permissions.
    if (!getStoredUser()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    authService
      .myPermissions()
      .then((res) => {
        if (cancelled) return;
        setPermissions(res.permissions);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        clearSession();
        setUser(null);
        setPermissions([]);
        setLoading(false);
      });
    const onUnauthorized = () => logout();
    window.addEventListener('agencyos:unauthorized', onUnauthorized);
    return () => {
      cancelled = true;
      window.removeEventListener('agencyos:unauthorized', onUnauthorized);
    };
  }, [logout, initialUser]);

  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    const { token, user: loggedUser } = await authService.login(email, password);
    saveSession(token, loggedUser, rememberMe);
    setUser(loggedUser);
    try {
      const perms = await authService.myPermissions();
      setPermissions(perms.permissions);
    } catch {
      setPermissions([]);
    }
    return loggedUser;
  }, []);

  const refreshPermissions = useCallback(async () => {
    const perms = await authService.myPermissions();
    setPermissions(perms.permissions);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      permissions,
      loading,
      login,
      logout,
      refreshPermissions,
      can: (permission: string) => permissions.includes(permission),
      isAdmin: user?.role === 'admin',
    }),
    [user, permissions, loading, login, logout, refreshPermissions],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthProvider;
