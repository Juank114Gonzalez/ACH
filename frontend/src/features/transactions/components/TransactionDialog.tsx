'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, TrendingUp, TrendingDown } from 'lucide-react';
import { useCreateTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { toast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types';
import { format } from 'date-fns';

const schema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce.number().positive('Must be positive'),
  description: z.string().min(1, 'Required').max(255),
  categoryId: z.string().min(1, 'Select a category'),
  date: z.string().min(1, 'Required'),
  notes: z.string().max(1000).optional(),
});
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
}

export function TransactionDialog({ open, onClose, transaction }: Props) {
  const create = useCreateTransaction();
  const update = useUpdateTransaction();
  const { data: categories } = useCategories();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EXPENSE', date: format(new Date(), 'yyyy-MM-dd') },
  });

  const selectedType = watch('type');
  const filteredCategories = categories?.filter((c) => c.type === selectedType) ?? [];

  useEffect(() => {
    if (open) {
      if (transaction) {
        reset({
          type: transaction.type,
          amount: Number(transaction.amount),
          description: transaction.description,
          categoryId: transaction.categoryId,
          date: format(new Date(transaction.date), 'yyyy-MM-dd'),
          notes: transaction.notes ?? '',
        });
      } else {
        reset({ type: 'EXPENSE', date: format(new Date(), 'yyyy-MM-dd'), amount: undefined as never, description: '', categoryId: '', notes: '' });
      }
    }
  }, [open, transaction, reset]);

  async function onSubmit(data: FormData) {
    try {
      if (transaction) {
        await update.mutateAsync({ id: transaction.id, ...data });
        toast({ title: 'Transaction updated' });
      } else {
        await create.mutateAsync(data as never);
        toast({ title: 'Transaction created' });
      }
      onClose();
    } catch {
      toast({ variant: 'destructive', title: 'Something went wrong', description: 'Please check your input and try again.' });
    }
  }

  if (!open) return null;

  const pending = create.isPending || update.isPending;
  const isEditing = Boolean(transaction);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[520px] rounded-2xl bg-card shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">
            {isEditing ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Type toggle */}
          <div>
            <label className="mb-2 block text-sm font-medium">Type</label>
            <div className="flex gap-2">
              {(['EXPENSE', 'INCOME'] as const).map((t) => {
                const Icon = t === 'INCOME' ? TrendingUp : TrendingDown;
                const active = selectedType === t;
                return (
                  <label
                    key={t}
                    className={cn(
                      'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all',
                      active && t === 'INCOME' && 'border-success bg-success/10 text-success',
                      active && t === 'EXPENSE' && 'border-destructive bg-destructive/10 text-destructive',
                      !active && 'text-muted-foreground hover:border-border hover:bg-muted/50',
                    )}
                  >
                    <input {...register('type')} type="radio" value={t} className="sr-only" />
                    <Icon className="h-4 w-4" />
                    {t === 'INCOME' ? 'Income' : 'Expense'}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Amount — prominent */}
          <div>
            <label className="mb-2 block text-sm font-medium">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">$</span>
              <input
                {...register('amount')}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className={cn(
                  'w-full rounded-xl border bg-background pl-10 pr-4 py-4 text-2xl font-bold tabular-nums',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                  errors.amount && 'border-destructive',
                )}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">Description</label>
            <Input
              {...register('description')}
              type="text"
              placeholder="What was this for?"
              error={Boolean(errors.description)}
            />
            {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
          </div>

          {/* Category + Date row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Category</label>
              <select
                {...register('categoryId')}
                className={cn(
                  'input-base',
                  errors.categoryId && 'border-destructive',
                )}
              >
                <option value="">Select...</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="mt-1 text-xs text-destructive">{errors.categoryId.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Date</label>
              <input
                {...register('date')}
                type="date"
                className={cn('input-base', errors.date && 'border-destructive')}
              />
              {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Notes <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Additional details..."
              className="input-base resize-none"
            />
          </div>

          {/* Footer actions */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={pending}>
              {isEditing ? 'Save Changes' : 'Create Transaction'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
