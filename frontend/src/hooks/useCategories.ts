'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category, ApiResponse, MovementType } from '@/types';

export const categoryKeys = {
  all: ['categories'] as const,
  list: (type?: MovementType) => [...categoryKeys.all, 'list', type] as const,
};

export function useCategories(type?: MovementType) {
  return useQuery({
    queryKey: categoryKeys.list(type),
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>('/categories', { params: { type } });
      return res.data.data!;
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Pick<Category, 'name' | 'color' | 'icon' | 'type'>) => {
      const res = await api.post<ApiResponse<Category>>('/categories', data);
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Category> & { id: string }) => {
      const res = await api.patch<ApiResponse<Category>>(`/categories/${id}`, data);
      return res.data.data!;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}
