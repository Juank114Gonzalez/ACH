'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle, AlertCircle, TrendingUp, Wallet } from 'lucide-react';
import { useBudgets, useDeleteBudget, useBudgetAlerts } from '@/hooks/useBudgets';
import { BudgetDialog } from './components/BudgetDialog';
import { formatCurrency, getBudgetStatus, cn } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/common/EmptyState';
import { BudgetCardSkeleton } from '@/components/common/LoadingState';
import type { Budget } from '@/types';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const YEARS = [2024, 2025, 2026, 2027];

export function BudgetsView() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);

  const { data: budgets, isLoading } = useBudgets(month, year);
  const { data: alerts } = useBudgetAlerts(month, year);
  const deleteMutation = useDeleteBudget();

  const totalBudget = budgets?.reduce((s, b) => s + Number(b.amount), 0) ?? 0;
  const totalSpent = budgets?.reduce((s, b) => s + Number(b.spent), 0) ?? 0;
  const overallPct = totalBudget > 0 ? Math.floor((totalSpent / totalBudget) * 100) : 0;

  function handleDelete(id: string) {
    if (!confirm('Delete this budget?')) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Budget deleted' }),
      onError: () => toast({ variant: 'destructive', title: 'Failed to delete' }),
    });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Budgets"
        description="Track your spending against financial goals"
        actions={
          <div className="flex items-center gap-3">
            {/* Period selector */}
            <div className="flex items-center gap-1 rounded-xl border bg-card p-1">
              {[month - 1, month, month + 1]
                .filter((m) => m >= 1 && m <= 12)
                .map((m) => (
                  <button
                    key={m}
                    onClick={() => setMonth(m)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                      m === month
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {MONTHS[m - 1].slice(0, 3)} {year}
                  </button>
                ))}
            </div>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => { setEditing(null); setDialogOpen(true); }}
            >
              <Plus className="h-3.5 w-3.5" />
              New Budget
            </Button>
          </div>
        }
      />

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div
              key={a.budgetId}
              className={cn(
                'flex items-start gap-3 rounded-xl border px-4 py-3',
                a.level === 'exceeded'
                  ? 'border-destructive/30 bg-destructive/5'
                  : 'border-warning/30 bg-warning/5',
              )}
            >
              {a.level === 'exceeded' ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              )}
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-semibold', a.level === 'exceeded' ? 'text-destructive' : 'text-warning')}>
                  {a.level === 'exceeded'
                    ? `${a.categoryName} budget exceeded — ${a.percentage}% used`
                    : `${a.categoryName} budget at ${a.percentage}% — ${formatCurrency(a.spent)} of ${formatCurrency(a.limit)} used`}
                </p>
              </div>
              <button className="shrink-0 text-muted-foreground hover:text-foreground">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Summary cards */}
      {budgets && budgets.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="p-0">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Total Budget</p>
              <p className="mt-1 text-xl font-bold">{formatCurrency(totalBudget)}</p>
            </CardContent>
          </Card>
          <Card className="p-0">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Total Spent</p>
              <p className={cn('mt-1 text-xl font-bold', overallPct >= 100 ? 'text-destructive' : overallPct >= 80 ? 'text-warning' : '')}>
                {formatCurrency(totalSpent)}
              </p>
            </CardContent>
          </Card>
          <Card className="p-0">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">Overall Progress</p>
                <span className={cn('text-xs font-semibold', overallPct >= 100 ? 'text-destructive' : overallPct >= 80 ? 'text-warning' : 'text-primary')}>
                  {overallPct}%
                </span>
              </div>
              <Progress
                value={Math.min(overallPct, 100)}
                className="h-2"
                indicatorClassName={cn(
                  overallPct >= 100 ? 'bg-destructive' : overallPct >= 80 ? 'bg-warning' : 'bg-primary',
                )}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget cards grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <BudgetCardSkeleton key={i} />)}
        </div>
      ) : !budgets || budgets.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No budgets this period"
          description="Create budgets to track your spending and get alerts before you overspend."
          action={{ label: 'Create Budget', onClick: () => { setEditing(null); setDialogOpen(true); } }}
          className="py-20"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {budgets.map((b) => {
            const { level, percentage, color } = getBudgetStatus(Number(b.spent), Number(b.amount));
            return (
              <Card
                key={b.id}
                className={cn(
                  'group transition-shadow hover:shadow-md overflow-hidden',
                  level === 'exceeded' && 'border-destructive/40',
                  level === 'warning' && 'border-warning/40',
                )}
              >
                {/* Color stripe */}
                <div className="h-1 w-full" style={{ backgroundColor: b.category.color }} />

                <CardContent className="p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                        style={{ backgroundColor: b.category.color }}
                      >
                        {b.category.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{b.category.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {MONTHS[b.month - 1]} {b.year}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => { setEditing(b); setDialogOpen(true); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleDelete(b.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Percentage display */}
                  <div className="mb-2 flex items-end justify-between">
                    <div>
                      <p
                        className={cn(
                          'text-3xl font-bold tabular-nums',
                          level === 'exceeded' && 'text-destructive',
                          level === 'warning' && 'text-warning',
                        )}
                      >
                        {percentage}%
                        {level === 'exceeded' && (
                          <Badge variant="destructive" className="ml-2 text-[10px] align-middle">
                            Over
                          </Badge>
                        )}
                      </p>
                    </div>
                    {level !== 'safe' && (
                      level === 'exceeded'
                        ? <AlertCircle className="h-5 w-5 text-destructive" />
                        : <AlertTriangle className="h-5 w-5 text-warning" />
                    )}
                  </div>

                  <Progress
                    value={Math.min(percentage, 100)}
                    className="h-2 mb-2"
                    indicatorClassName={color}
                  />

                  <p className="text-xs text-muted-foreground">
                    <span className={cn('font-semibold', level === 'exceeded' ? 'text-destructive' : '')}>
                      {formatCurrency(Number(b.spent))}
                    </span>
                    {' / '}
                    {formatCurrency(Number(b.amount))}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <BudgetDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        budget={editing}
        defaultMonth={month}
        defaultYear={year}
      />
    </div>
  );
}
