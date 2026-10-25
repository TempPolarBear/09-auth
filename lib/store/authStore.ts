import { create } from 'zustand';
import type { User } from '@/types/user';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setUser: (user: User) => void;
  clearIsAuthenticated: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  setUser: (user) => set({ user, isAuthenticated: true, isInitialized: true }),
  clearIsAuthenticated: () => set({ user: null, isAuthenticated: false, isInitialized: true }),
  setInitialized: () => set({ isInitialized: true }),
}));
