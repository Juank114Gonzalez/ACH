'use client';

import { create } from 'zustand';
import type { User } from '@/types';
import { setAccessToken, clearAccessToken } from '@/lib/api';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  /** true once the store has read from storage — prevents redirect-on-F5 */
  _hasHydrated: boolean;
  setAuth: (user: User, accessToken: string, remember?: boolean) => void;
  clearAuth: () => void;
  hydrate: () => void;
}

const STORAGE_KEY = 'ach-auth';

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  _hasHydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) ??
        sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { user, isAuthenticated } = JSON.parse(raw) as {
          user: User;
          isAuthenticated: boolean;
        };
        // Re-attach access token to axios so first API calls work immediately
        const token =
          localStorage.getItem('accessToken') ??
          sessionStorage.getItem('accessToken');
        if (token) setAccessToken(token);
        set({ user, isAuthenticated, _hasHydrated: true });
        return;
      }
    } catch {
      // corrupted storage — ignore
    }
    set({ _hasHydrated: true });
  },

  setAuth: (user, accessToken, remember = true) => {
    if (typeof window !== 'undefined') {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem(STORAGE_KEY, JSON.stringify({ user, isAuthenticated: true }));
      storage.setItem('accessToken', accessToken);
      // Remove from the other storage to avoid stale state
      if (remember) {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem('accessToken');
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem('accessToken');
      }
    }
    setAccessToken(accessToken);
    set({ user, isAuthenticated: true });
  },

  clearAuth: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('accessToken');
    }
    clearAccessToken();
    set({ user: null, isAuthenticated: false });
  },
}));
