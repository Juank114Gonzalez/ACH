'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Budget, BudgetAlert, ApiResponse } from '@/types';

export const budgetKeys = {
  all: ['budgets'] as const,
  list: (month?: number, year?: number) => [...budgetKeys.all, 'list', month, year] as const,
  alerts: (month?: number, year?: number) => [...budgetKeys.all, 'alerts', month, year] as const,
};

export function useBudgets(month?: number, year?: number) {
  return useQuery({
    queryKey: budgetKeys.list(month, year),
    queryFn: async () => {
      const res = await api.get<ApiResponse<Budget[]>>('/budgets', { params: { month, year } });
      return res.data.data!;
    },
  });
}

export function useBudgetAlerts(month?: number, year?: number) {
  return useQuery({
    queryKey: budgetKeys.alerts(month, year),
    queryFn: async () => {
      const res = await api.get<ApiResponse<BudgetAlert[]>>('/budgets/alerts', {
        params: { month, year },
      });
      return res.data.data!;
    },
  });
}

export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Pick<Budget, 'categoryId' | 'amount' | 'month' | 'year'>) => {
      const res = await api.post<ApiResponse<Budget>>('/budgets', data);
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.all }),
  });
}

export function useUpdateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Budget> & { id: string }) => {
      const res = await api.patch<ApiResponse<Budget>>(`/budgets/${id}`, data);
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.all }),
  });
}

export function useDeleteBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/budgets/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: budgetKeys.all }),
  });
}
