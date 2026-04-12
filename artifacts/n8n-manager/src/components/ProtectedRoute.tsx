import { ReactNode, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/stores/useAuthStore';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  requireAdmin?: boolean;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, requiredPermission, requireAdmin, adminOnly }: ProtectedRouteProps) {
  const { user, token, hasPermission } = useAuthStore();
  const [location, setLocation] = useLocation();

  const needsAdmin = requireAdmin || adminOnly;

  useEffect(() => {
    if (!token || !user) {
      setLocation('/login');
      return;
    }

    if (user.forcePasswordChange && location !== '/change-password') {
      setLocation('/change-password');
      return;
    }

    if (needsAdmin && user.role !== 'admin') {
      setLocation('/');
      return;
    }

    if (requiredPermission && !hasPermission(requiredPermission)) {
      setLocation('/');
      return;
    }
  }, [token, user, location, needsAdmin, requiredPermission, hasPermission, setLocation]);

  if (!token || !user) return null;
  if (user.forcePasswordChange && location !== '/change-password') return null;
  if (needsAdmin && user.role !== 'admin') return null;
  if (requiredPermission && !hasPermission(requiredPermission)) return null;

  return <>{children}</>;
}
