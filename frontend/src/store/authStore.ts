'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';
import { setAccessToken, clearAccessToken } from '@/lib/api';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user, accessToken) => {
        setAccessToken(accessToken);
        set({ user, isAuthenticated: true });
      },
      clearAuth: () => {
        clearAccessToken();
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'ach-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);
