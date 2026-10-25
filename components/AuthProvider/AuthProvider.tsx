'use client';

import { useEffect, type ReactNode } from 'react';
import { checkSession, getMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    let cancelled = false;
    const initialUser = useAuthStore.getState().user;
    const isCurrent = () => !cancelled && useAuthStore.getState().user === initialUser;

    async function initialize() {
      try {
        const valid = await checkSession();
        const user = valid ? await getMe() : null;
        if (!isCurrent()) return;
        if (user) useAuthStore.getState().setUser(user);
        else useAuthStore.getState().clearIsAuthenticated();
      } catch {
        if (isCurrent()) useAuthStore.getState().clearIsAuthenticated();
      } finally {
        if (!cancelled) useAuthStore.getState().setInitialized();
      }
    }

    void initialize();
    return () => {
      cancelled = true;
    };
  }, []);

  return children;
}
