import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';

/** Redirects to /login when there is no active session (preserves target). */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div role="status" aria-label="Loading session" style={{ padding: 32 }}>Loading…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

export default ProtectedRoute;
