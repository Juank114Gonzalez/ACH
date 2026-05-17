'use client';

import { useState } from 'react';
import { Plus, Search, ArrowLeftRight, CalendarDays, X } from 'lucide-react';
import { useTransactions, useDeleteTransaction, useBalanceSummary } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { TransactionDialog } from './components/TransactionDialog';
import { DataTable, type Column } from '@/components/common/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/useToast';
import type { Transaction, TransactionFilters } from '@/types';

export function TransactionsView() {
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, limit: 10 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const { data, isLoading } = useTransactions(filters);
  const { data: categories } = useCategories();
  const { data: summary } = useBalanceSummary();
  const deleteMutation = useDeleteTransaction();

  const setFilter = <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  function handleDelete(id: string) {
    if (!confirm('Delete this transaction? This cannot be undone.')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Transaction deleted' }),
      onError: () => toast({ variant: 'destructive', title: 'Failed to delete' }),
    });
  }

  const columns: Column<Transaction>[] = [
    {
      key: 'description',
      label: 'Description',
      render: (tx) => (
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: tx.category.color }}
          >
            {tx.category.name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{tx.description}</p>
            {tx.notes && <p className="truncate text-xs text-muted-foreground">{tx.notes}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      headerClassName: 'hidden md:table-cell',
      className: 'hidden md:table-cell',
      render: (tx) => (
        <Badge
          className="text-white text-xs"
          style={{ backgroundColor: tx.category.color }}
        >
          {tx.category.name}
        </Badge>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      headerClassName: 'hidden sm:table-cell',
      className: 'hidden sm:table-cell text-muted-foreground text-sm',
      render: (tx) => formatDate(tx.date, 'MMM dd, yyyy'),
    },
    {
      key: 'amount',
      label: 'Amount',
      headerClassName: 'text-right',
      className: 'text-right',
      render: (tx) => (
        <span className={cn('text-sm font-semibold tabular-nums', tx.type === 'INCOME' ? 'text-success' : 'text-destructive')}>
          {tx.type === 'INCOME' ? '+' : '-'}
          {formatCurrency(Number(tx.amount))}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      headerClassName: 'w-20',
      className: 'w-20',
      render: (tx) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => { e.stopPropagation(); setEditing(tx); setDialogOpen(true); }}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Transactions"
        description={`${data?.meta.total ?? 0} transactions`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-2"
              onClick={() => { setEditing(null); setDialogOpen(true); }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Transaction
            </Button>
          </div>
        }
      />

      {/* Summary row */}
      {summary && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Income', value: summary.totalIncome, variant: 'income' as const },
            { label: 'Total Expenses', value: summary.totalExpenses, variant: 'expense' as const },
            { label: 'Net Balance', value: summary.balance, variant: 'default' as const },
          ].map(({ label, value, variant }) => (
            <Card key={label} className="p-0">
              <CardContent className="p-4">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className={cn(
                  'mt-1 text-lg font-bold tabular-nums',
                  variant === 'income' && 'text-success',
                  variant === 'expense' && 'text-destructive',
                )}>
                  {variant === 'expense' && '-'}
                  {formatCurrency(Math.abs(value))}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative min-w-52 flex-1">
          <Input
            placeholder="Search transactions..."
            startIcon={<Search className="h-4 w-4" />}
            onChange={(e) => setFilter('search', e.target.value || undefined)}
          />
        </div>

        {/* Type */}
        <Select
          onValueChange={(v) => setFilter('type', (v === 'all' ? undefined : v) as TransactionFilters['type'])}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>

        {/* Category */}
        <Select
          onValueChange={(v) => setFilter('categoryId', v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <CalendarDays className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              aria-label="Start date"
              value={filters.startDate ?? ''}
              onChange={(e) => setFilter('startDate', e.target.value || undefined)}
              className="input-base pl-9 pr-3 w-40 cursor-pointer"
            />
            {filters.startDate && (
              <button
                type="button"
                onClick={() => setFilter('startDate', undefined)}
                className="absolute right-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <span className="text-xs text-muted-foreground">to</span>
          <div className="relative flex items-center">
            <CalendarDays className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              aria-label="End date"
              value={filters.endDate ?? ''}
              min={filters.startDate}
              onChange={(e) => setFilter('endDate', e.target.value || undefined)}
              className="input-base pl-9 pr-3 w-40 cursor-pointer"
            />
            {filters.endDate && (
              <button
                type="button"
                onClick={() => setFilter('endDate', undefined)}
                className="absolute right-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Sort */}
        <Select
          onValueChange={(v) => {
            const [sortBy, sortOrder] = v.split('-') as [TransactionFilters['sortBy'], TransactionFilters['sortOrder']];
            setFilters((f) => ({ ...f, sortBy, sortOrder, page: 1 }));
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort: Date (newest)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Date (newest)</SelectItem>
            <SelectItem value="date-asc">Date (oldest)</SelectItem>
            <SelectItem value="amount-desc">Amount (highest)</SelectItem>
            <SelectItem value="amount-asc">Amount (lowest)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        data={data?.data ?? []}
        columns={columns}
        loading={isLoading}
        meta={data?.meta}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        rowKey={(tx) => tx.id}
        emptyIcon={ArrowLeftRight}
        emptyTitle="No transactions found"
        emptyDescription="Try adjusting your filters, or add your first transaction."
        emptyActionLabel="Add Transaction"
        onEmptyAction={() => { setEditing(null); setDialogOpen(true); }}
      />

      <TransactionDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        transaction={editing}
      />
    </div>
  );
}
