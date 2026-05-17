'use client';

import { useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';
import { Download, TrendingUp, TrendingDown, Target, Award } from 'lucide-react';
import { useBalanceSummary, useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KpiCard } from '@/components/common/KpiCard';
import { formatCurrency, cn } from '@/lib/utils';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#a855f7', '#ec4899'];

const ranges = ['1M', '3M', '6M', '1Y'] as const;
type Range = (typeof ranges)[number];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5 shadow-xl text-sm">
      <p className="mb-1.5 font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          {p.color && <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />}
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function generateCashFlowData(range: Range) {
  const counts: Record<Range, number> = { '1M': 4, '3M': 3, '6M': 6, '1Y': 12 };
  const labels: Record<Range, string[]> = {
    '1M': ['W1', 'W2', 'W3', 'W4'],
    '3M': ['Mar', 'Apr', 'May'],
    '6M': ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
    '1Y': ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
  };
  return labels[range].map((label) => ({
    label,
    income: 5000 + Math.random() * 4000,
    expenses: 2000 + Math.random() * 2500,
  }));
}

function generateNetWorthData(range: Range) {
  const counts: Record<Range, number> = { '1M': 30, '3M': 13, '6M': 6, '1Y': 12 };
  const n = counts[range];
  let val = 80000;
  return Array.from({ length: n }, (_, i) => {
    val += (Math.random() - 0.3) * 3000 + 500;
    return { label: String(i + 1), value: Math.round(val) };
  });
}

export function AnalyticsView() {
  const [range, setRange] = useState<Range>('6M');
  const now = new Date();
  const { data: summary } = useBalanceSummary();
  const { data: budgets } = useBudgets(now.getMonth() + 1, now.getFullYear());

  const cashFlowData = generateCashFlowData(range);
  const netWorthData = generateNetWorthData(range);

  const spendingByCategory =
    budgets
      ?.filter((b) => Number(b.spent) > 0)
      .sort((a, b) => Number(b.spent) - Number(a.spent))
      .slice(0, 7)
      .map((b, i) => ({
        name: b.category.name,
        value: Number(b.spent),
        color: b.category.color || COLORS[i % COLORS.length],
      })) ?? [];

  const totalSpent = spendingByCategory.reduce((s, x) => s + x.value, 0);

  const avgIncome = cashFlowData.reduce((s, d) => s + d.income, 0) / (cashFlowData.length || 1);
  const avgExpenses = cashFlowData.reduce((s, d) => s + d.expenses, 0) / (cashFlowData.length || 1);
  const savingsRate = avgIncome > 0 ? ((avgIncome - avgExpenses) / avgIncome) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Analytics"
        description="Financial insights and trends"
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
              {ranges.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
                    range === r
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        }
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Avg Monthly Income"
          value={formatCurrency(avgIncome)}
          icon={TrendingUp}
          iconColor="bg-success"
          trend={1.8}
        />
        <KpiCard
          title="Avg Monthly Expenses"
          value={formatCurrency(avgExpenses)}
          icon={TrendingDown}
          iconColor="bg-destructive"
          trend={-2.1}
        />
        <KpiCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          icon={Target}
          iconColor="bg-primary"
          trend={3.2}
        />
        <KpiCard
          title="Net Balance"
          value={formatCurrency(summary?.balance ?? 0)}
          icon={Award}
          iconColor="bg-cyan-500"
          trend={5.4}
        />
      </div>

      {/* Cash flow + category breakdown */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Monthly Cash Flow</CardTitle>
            <CardDescription>Income vs Expenses comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={cashFlowData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="label"
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
                <Bar dataKey="income" name="Income" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>By category this month</CardDescription>
          </CardHeader>
          <CardContent>
            {spendingByCategory.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={spendingByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {spendingByCategory.map((entry, i) => (
                        <Cell key={i} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 space-y-2">
                  {spendingByCategory.map((d, i) => {
                    const pct = totalSpent > 0 ? Math.round((d.value / totalSpent) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="flex-1 truncate text-muted-foreground">{d.name}</span>
                        <span className="font-semibold tabular-nums">{pct}%</span>
                        <span className="text-muted-foreground tabular-nums">{formatCurrency(d.value, 'USD', true)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No spending data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Net worth + top categories */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Net Worth Over Time</CardTitle>
            <CardDescription>Cumulative balance growth</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={netWorthData}>
                <defs>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="label"
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
                  dataKey="value"
                  name="Net Worth"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#netGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top Spending</CardTitle>
            <CardDescription>Categories ranked by spend</CardDescription>
          </CardHeader>
          <CardContent>
            {spendingByCategory.length > 0 ? (
              <div className="space-y-3">
                {spendingByCategory.slice(0, 6).map((d, i) => {
                  const pct = totalSpent > 0 ? (d.value / totalSpent) * 100 : 0;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">#{i + 1}</span>
                          <span className="font-medium">{d.name}</span>
                        </div>
                        <span className="font-semibold tabular-nums">{formatCurrency(d.value, 'USD', true)}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, backgroundColor: d.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                No data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
