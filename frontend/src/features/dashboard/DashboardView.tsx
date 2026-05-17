'use client';

import { DollarSign, TrendingUp, TrendingDown, PiggyBank, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useBalanceSummary, useTransactions } from '@/hooks/useTransactions';
import { useBudgets, useBudgetAlerts } from '@/hooks/useBudgets';
import { KpiCard } from '@/components/common/KpiCard';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatDate, getBudgetStatus, cn } from '@/lib/utils';
import { ErrorState } from '@/components/common/ErrorState';
import { KpiCardSkeleton } from '@/components/common/LoadingState';

const CHART_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#ec4899'];

const AREA_GRADIENT = 'url(#areaGradient)';

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg text-sm">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-muted-foreground">
          {p.name}: <span className="font-semibold text-foreground">{formatCurrency(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function DashboardView() {
  const now = new Date();
  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useBalanceSummary();
  const { data: txData, isLoading: txLoading } = useTransactions({
    limit: 6,
    sortBy: 'date',
    sortOrder: 'desc',
  });
  const { data: budgets } = useBudgets(now.getMonth() + 1, now.getFullYear());
  const { data: alerts } = useBudgetAlerts(now.getMonth() + 1, now.getFullYear());

  const savingsRate =
    summary && summary.totalIncome > 0
      ? (summary.balance / summary.totalIncome) * 100
      : 0;

  const spendingChartData =
    budgets
      ?.filter((b) => Number(b.spent) > 0)
      .slice(0, 7)
      .map((b) => ({ name: b.category.name, value: Number(b.spent), color: b.category.color })) ??
    [];

  if (summaryError) {
    return <ErrorState onRetry={() => refetchSummary()} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Your financial snapshot"
        actions={
          <Button asChild size="sm" className="gap-2">
            <Link href="/transactions">
              <Plus className="h-3.5 w-3.5" />
              Add Transaction
            </Link>
          </Button>
        }
      />

      {/* Budget alerts */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((a) => (
            <div
              key={a.budgetId}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium',
                a.level === 'exceeded'
                  ? 'border-destructive/30 bg-destructive/5 text-destructive'
                  : 'border-warning/30 bg-warning/5 text-warning',
              )}
            >
              <span className="text-base">{a.level === 'exceeded' ? '🚨' : '⚠️'}</span>
              <span className="flex-1">
                <strong>{a.categoryName}</strong>{' '}
                {a.level === 'exceeded' ? 'budget exceeded' : 'approaching budget limit'} —{' '}
                {a.percentage}% used ({formatCurrency(a.spent)} of {formatCurrency(a.limit)})
              </span>
              <Link
                href="/budgets"
                className="shrink-0 text-xs underline underline-offset-2 opacity-70 hover:opacity-100"
              >
                View budgets
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryLoading ? (
          Array.from({ length: 4 }).map((_, i) => <KpiCardSkeleton key={i} />)
        ) : (
          <>
            <KpiCard
              title="Total Balance"
              value={formatCurrency(summary?.balance ?? 0)}
              icon={DollarSign}
              iconColor="bg-primary"
              trend={summary && summary.balance >= 0 ? 2.4 : -2.4}
              trendLabel="vs last month"
            />
            <KpiCard
              title="Monthly Income"
              value={formatCurrency(summary?.totalIncome ?? 0)}
              icon={TrendingUp}
              iconColor="bg-success"
              trend={1.2}
            />
            <KpiCard
              title="Monthly Expenses"
              value={formatCurrency(summary?.totalExpenses ?? 0)}
              icon={TrendingDown}
              iconColor="bg-destructive"
              trend={-0.8}
            />
            <KpiCard
              title="Savings Rate"
              value={`${savingsRate.toFixed(1)}%`}
              icon={PiggyBank}
              iconColor="bg-cyan-500"
              trend={4.0}
            />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Area chart */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Balance Over Time</CardTitle>
            <Badge variant="secondary" className="text-xs">This year</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={generateMockMonthlyData(summary?.balance ?? 5000)}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => formatCurrency(v, 'USD', true)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill={AREA_GRADIENT}
                  dot={false}
                  activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donut chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {spendingChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={spendingChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {spendingChartData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-2">
                  {spendingChartData.map((d, i) => {
                    const total = spendingChartData.reduce((s, x) => s + x.value, 0);
                    const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: d.color || CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <span className="flex-1 truncate text-muted-foreground">{d.name}</span>
                        <span className="font-semibold">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex h-48 flex-col items-center justify-center gap-2">
                <PiggyBank className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No budget data yet</p>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/budgets">Set up budgets</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom row: transactions + budgets */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Recent transactions */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle>Recent Transactions</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/transactions">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {txLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-6 py-3.5">
                      <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-44 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                      </div>
                      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                    </div>
                  ))
                : txData?.data.length === 0
                ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <ArrowRight className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No transactions yet</p>
                  </div>
                )
                : txData?.data.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/30 transition-colors">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ backgroundColor: tx.category.color }}
                      >
                        {tx.category.name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{tx.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {tx.category.name} · {formatDate(tx.date, 'MMM dd')}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 text-sm font-semibold',
                          tx.type === 'INCOME' ? 'text-success' : 'text-destructive',
                        )}
                      >
                        {tx.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(Number(tx.amount))}
                      </span>
                    </div>
                  ))}
            </div>
          </CardContent>
        </Card>

        {/* Budget overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle>Budget Status</CardTitle>
            <Button asChild variant="ghost" size="sm" className="gap-1 text-xs">
              <Link href="/budgets">
                Manage <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {!budgets || budgets.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <p className="text-sm text-muted-foreground">No budgets this month</p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/budgets">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Create budget
                  </Link>
                </Button>
              </div>
            ) : (
              budgets.slice(0, 5).map((b) => {
                const { level, percentage, color } = getBudgetStatus(
                  Number(b.spent),
                  Number(b.amount),
                );
                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: b.category.color }}
                        />
                        <span className="truncate font-medium">{b.category.name}</span>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 font-semibold',
                          level === 'exceeded'
                            ? 'text-destructive'
                            : level === 'warning'
                            ? 'text-warning'
                            : 'text-muted-foreground',
                        )}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <Progress
                      value={percentage}
                      className="h-1.5"
                      indicatorClassName={color}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      {formatCurrency(Number(b.spent))} of {formatCurrency(Number(b.amount))}
                    </p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function generateMockMonthlyData(currentBalance: number) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const base = currentBalance * 0.6;
  return months.slice(0, new Date().getMonth() + 1).map((month, i) => ({
    month,
    balance: Math.round(base + base * (i / 11) * 0.7 + (Math.random() - 0.3) * base * 0.1),
  }));
}
