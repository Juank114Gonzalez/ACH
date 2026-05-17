'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Transaction,
  PaginatedResult,
  BalanceSummary,
  ApiResponse,
  TransactionFilters,
} from '@/types';

export const transactionKeys = {
  all: ['transactions'] as const,
  list: (filters: TransactionFilters) => [...transactionKeys.all, 'list', filters] as const,
  detail: (id: string) => [...transactionKeys.all, 'detail', id] as const,
  summary: (start?: string, end?: string) => [...transactionKeys.all, 'summary', start, end] as const,
};

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: async () => {
      const res = await api.get<PaginatedResult<Transaction>>('/transactions', { params: filters });
      return res.data;
    },
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: async () => {
      const res = await api.get<ApiResponse<Transaction>>(`/transactions/${id}`);
      return res.data.data!;
    },
    enabled: Boolean(id),
  });
}

export function useBalanceSummary(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: transactionKeys.summary(startDate, endDate),
    queryFn: async () => {
      const res = await api.get<ApiResponse<BalanceSummary>>('/transactions/summary', {
        params: { startDate, endDate },
      });
      return res.data.data!;
    },
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Transaction, 'id' | 'userId' | 'category' | 'createdAt' | 'updatedAt'>) => {
      const res = await api.post<ApiResponse<Transaction>>('/transactions', data);
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: transactionKeys.all }),
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Transaction> & { id: string }) => {
      const res = await api.patch<ApiResponse<Transaction>>(`/transactions/${id}`, data);
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: transactionKeys.all }),
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transactions/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: transactionKeys.all }),
  });
}
