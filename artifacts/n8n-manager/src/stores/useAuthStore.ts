import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPermission {
  key: string;
  isEnabled: boolean;
}

interface AuthUser {
  id: number;
  username: string;
  role: string;
  isActive: boolean;
  forcePasswordChange: boolean;
  lastLogin?: string | null;
  createdAt?: string;
  permissions?: UserPermission[];
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  hasPermission: (key: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      clearAuth: () => set({ user: null, token: null }),
      hasPermission: (key) => {
        const { user } = get();
        if (!user) return false;
        if (user.role === 'admin') return true;
        const permission = user.permissions?.find((p) => p.key === key);
        return permission?.isEnabled ?? false;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
