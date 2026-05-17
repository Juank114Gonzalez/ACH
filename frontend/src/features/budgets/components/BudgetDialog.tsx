'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { useCreateBudget, useUpdateBudget } from '@/hooks/useBudgets';
import { useCategories } from '@/hooks/useCategories';
import { toast } from '@/hooks/useToast';
import type { Budget } from '@/types';

const schema = z.object({
  categoryId: z.string().min(1, 'Required'),
  amount: z.coerce.number().positive('Must be positive'),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  budget?: Budget | null;
  defaultMonth?: number;
  defaultYear?: number;
}

export function BudgetDialog({ open, onClose, budget, defaultMonth, defaultYear }: Props) {
  const create = useCreateBudget();
  const update = useUpdateBudget();
  const { data: categories } = useCategories('EXPENSE');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      month: defaultMonth ?? new Date().getMonth() + 1,
      year: defaultYear ?? new Date().getFullYear(),
    },
  });

  useEffect(() => {
    if (budget) {
      reset({ categoryId: budget.categoryId, amount: Number(budget.amount), month: budget.month, year: budget.year });
    } else {
      reset({ month: defaultMonth ?? new Date().getMonth() + 1, year: defaultYear ?? new Date().getFullYear(), amount: undefined as never, categoryId: '' });
    }
  }, [budget, defaultMonth, defaultYear, reset]);

  async function onSubmit(data: FormData) {
    try {
      if (budget) {
        await update.mutateAsync({ id: budget.id, amount: data.amount });
        toast({ title: 'Budget updated' });
      } else {
        await create.mutateAsync(data);
        toast({ title: 'Budget created' });
      }
      onClose();
    } catch {
      toast({ variant: 'destructive', title: 'Something went wrong' });
    }
  }

  if (!open) return null;

  const pending = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold">{budget ? 'Edit Budget' : 'New Budget'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          {!budget && (
            <div>
              <label className="mb-1 block text-sm font-medium">Category</label>
              <select {...register('categoryId')} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm">
                <option value="">Select category</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="mt-1 text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>
          )}

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Month</label>
              <select {...register('month')} disabled={Boolean(budget)} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm">
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Year</label>
              <select {...register('year')} disabled={Boolean(budget)} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm">
                {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Budget Limit</label>
            <input
              {...register('amount')}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm"
            />
            {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {budget ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
