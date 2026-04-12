import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTranslation } from 'react-i18next';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, requiredPermission, adminOnly }: ProtectedRouteProps) {
  const { user, token, hasPermission } = useAuthStore();
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  if (!token || !user) {
    setLocation('/login');
    return null;
  }

  if (adminOnly && user.role !== 'admin') {
    setLocation('/');
    return null;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    setLocation('/');
    return null;
  }

  return <>{children}</>;
}
