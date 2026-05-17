'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { User, ApiResponse } from '@/types';

interface LoginPayload { email: string; password: string }
interface RegisterPayload { email: string; name: string; password: string }
interface AuthResponse { user: User; accessToken: string }

export function useAuth() {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload);
      return res.data.data!;
    },
    onSuccess: ({ user: u, accessToken }) => {
      setAuth(u, accessToken);
      router.push('/dashboard');
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload);
      return res.data.data!;
    },
    onSuccess: ({ user: u, accessToken }) => {
      setAuth(u, accessToken);
      router.push('/dashboard');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSettled: () => {
      clearAuth();
      qc.clear();
      router.push('/login');
    },
  });

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    loginPending: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    registerPending: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutate,
    logoutPending: logoutMutation.isPending,
  };
}
