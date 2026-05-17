'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Tag, TrendingUp, TrendingDown } from 'lucide-react';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
import { CategoryDialog } from './components/CategoryDialog';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from '@/hooks/useToast';
import type { Category } from '@/types';
import { cn } from '@/lib/utils';

export function CategoriesView() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const { data: categories, isLoading } = useCategories();
  const deleteMutation = useDeleteCategory();

  function handleDelete(cat: Category) {
    if (cat.isDefault) {
      toast({ variant: 'destructive', title: 'Cannot delete a default category' });
      return;
    }
    if (!confirm(`Delete "${cat.name}"? Transactions with this category will be affected.`)) return;
    deleteMutation.mutate(cat.id, {
      onSuccess: () => toast({ title: 'Category deleted' }),
      onError: () => toast({ variant: 'destructive', title: 'Failed to delete' }),
    });
  }

  const income = categories?.filter((c) => c.type === 'INCOME') ?? [];
  const expense = categories?.filter((c) => c.type === 'EXPENSE') ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Categories"
        description="Organize your income and expenses"
        actions={
          <Button
            size="sm"
            className="gap-2"
            onClick={() => { setEditing(null); setDialogOpen(true); }}
          >
            <Plus className="h-3.5 w-3.5" />
            New Category
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {(
          [
            { label: 'Income', icon: TrendingUp, items: income, type: 'INCOME' as const },
            { label: 'Expense', icon: TrendingDown, items: expense, type: 'EXPENSE' as const },
          ] as const
        ).map(({ label, icon: Icon, items }) => (
          <Card key={label}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'flex h-7 w-7 items-center justify-center rounded-lg',
                    label === 'Income' ? 'bg-success/10' : 'bg-destructive/10',
                  )}>
                    <Icon className={cn('h-3.5 w-3.5', label === 'Income' ? 'text-success' : 'text-destructive')} />
                  </div>
                  <CardTitle className="text-base">{label} Categories</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {items.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="divide-y">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-6 py-3.5">
                      <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <EmptyState
                  icon={Tag}
                  title={`No ${label.toLowerCase()} categories`}
                  description="Create a category to start organizing your transactions."
                  action={{
                    label: `Add ${label} Category`,
                    onClick: () => { setEditing(null); setDialogOpen(true); },
                  }}
                  className="rounded-none border-0 py-12"
                />
              ) : (
                <div className="divide-y">
                  {items.map((cat) => (
                    <div
                      key={cat.id}
                      className="group flex items-center gap-3 px-6 py-3 transition-colors hover:bg-muted/30"
                    >
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{cat.name}</p>
                          {cat.isDefault && (
                            <Badge variant="secondary" className="text-[10px] h-4">
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <p className="text-xs text-muted-foreground">{cat.color}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => { setEditing(cat); setDialogOpen(true); }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(cat)}
                          disabled={cat.isDefault}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <CategoryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        category={editing}
      />
    </div>
  );
}
