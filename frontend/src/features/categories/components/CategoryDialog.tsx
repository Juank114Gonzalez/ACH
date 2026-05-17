'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { useCreateCategory, useUpdateCategory } from '@/hooks/useCategories';
import { toast } from '@/hooks/useToast';
import type { Category } from '@/types';

const PRESET_COLORS = [
  '#6366f1', '#22c55e', '#ef4444', '#f59e0b', '#3b82f6',
  '#ec4899', '#14b8a6', '#a855f7', '#f97316', '#06b6d4',
];

const schema = z.object({
  name: z.string().min(1, 'Required').max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  icon: z.string().min(1).max(50),
  type: z.enum(['INCOME', 'EXPENSE']),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  category?: Category | null;
}

export function CategoryDialog({ open, onClose, category }: Props) {
  const create = useCreateCategory();
  const update = useUpdateCategory();

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'EXPENSE', color: '#6366f1', icon: 'tag' },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (category) {
      reset({ name: category.name, color: category.color, icon: category.icon, type: category.type });
    } else {
      reset({ type: 'EXPENSE', color: '#6366f1', icon: 'tag', name: '' });
    }
  }, [category, reset]);

  async function onSubmit(data: FormData) {
    try {
      if (category) {
        await update.mutateAsync({ id: category.id, ...data });
        toast({ title: 'Category updated' });
      } else {
        await create.mutateAsync(data);
        toast({ title: 'Category created' });
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
          <h2 className="text-base font-semibold">{category ? 'Edit Category' : 'New Category'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              {...register('name')}
              type="text"
              placeholder="Category name"
              className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm"
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color', c)}
                  className={`h-8 w-8 rounded-full transition-transform ${selectedColor === c ? 'scale-110 ring-2 ring-ring ring-offset-2' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Type</label>
            <select {...register('type')} className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm" disabled={Boolean(category)}>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </select>
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
              {category ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
