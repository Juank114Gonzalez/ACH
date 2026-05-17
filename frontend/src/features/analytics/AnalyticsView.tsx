'use client';

import { useMemo, useState } from 'react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Award } from 'lucide-react';
import { useBalanceSummary, useTransactions } from '@/hooks/useTransactions';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KpiCard } from '@/components/common/KpiCard';
import { formatCurrency, cn } from '@/lib/utils';
import type { Transaction } from '@/types';

const COLORS = ['#6366f1', '#ef4444', '#f59e0b', '#22c55e', '#06b6d4', '#a855f7', '#ec4899'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ranges = ['1M', '3M', '6M', '1Y'] as const;
type Range = typeof ranges[number];

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

/** Return the ISO date string for N months ago */
function monthsAgo(n: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - n + 1);
  return d.toISOString().split('T')[0];
}

/** Group transactions into monthly buckets: { label, income, expenses } */
function buildCashFlow(transactions: Transaction[], range: Range) {
  const buckets: Record<string, { income: number; expenses: number }> = {};

  for (const tx of transactions) {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!buckets[key]) buckets[key] = { income: 0, expenses: 0 };
    if (tx.type === 'INCOME') buckets[key].income += Number(tx.amount);
    else buckets[key].expenses += Number(tx.amount);
  }

  // Fill in missing months in the range so the chart is continuous
  const months = range === '1M' ? 1 : range === '3M' ? 3 : range === '6M' ? 6 : 12;
  const result = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = range === '1M'
      ? `W${Math.ceil(d.getDate() / 7)}` // week label for 1M — but we aggregate by month anyway
      : MONTH_LABELS[d.getMonth()];
    result.push({ label, ...(buckets[key] ?? { income: 0, expenses: 0 }) });
  }
  return result;
}

/** Cumulative running balance per month */
function buildNetWorth(transactions: Transaction[], range: Range) {
  const months = range === '1M' ? 1 : range === '3M' ? 3 : range === '6M' ? 6 : 12;
  const buckets: Record<string, number> = {};

  for (const tx of transactions) {
    const d = new Date(tx.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!buckets[key]) buckets[key] = 0;
    buckets[key] += tx.type === 'INCOME' ? Number(tx.amount) : -Number(tx.amount);
  }

  let running = 0;
  const now = new Date();
  return Array.from({ length: months }, (_, idx) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - idx), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    running += buckets[key] ?? 0;
    return { label: MONTH_LABELS[d.getMonth()], value: running };
  });
}

/** Expenses grouped by category */
function buildSpendingByCategory(transactions: Transaction[]) {
  const map: Record<string, { name: string; value: number; color: string }> = {};
  for (const tx of transactions) {
    if (tx.type !== 'EXPENSE') continue;
    const id = tx.category.id;
    if (!map[id]) map[id] = { name: tx.category.name, value: 0, color: tx.category.color };
    map[id].value += Number(tx.amount);
  }
  return Object.values(map).sort((a, b) => b.value - a.value).slice(0, 7);
}

export function AnalyticsView() {
  const [range, setRange] = useState<Range>('6M');
  const { data: summary } = useBalanceSummary();

  const months = range === '1M' ? 1 : range === '3M' ? 3 : range === '6M' ? 6 : 12;
  const startDate = monthsAgo(months);

  const { data: txData } = useTransactions({
    limit: 500,
    startDate,
    sortBy: 'date',
    sortOrder: 'asc',
  });

  const transactions = txData?.data ?? [];

  const cashFlowData = useMemo(() => buildCashFlow(transactions, range), [transactions, range]);
  const netWorthData = useMemo(() => buildNetWorth(transactions, range), [transactions, range]);
  const spendingByCategory = useMemo(() => buildSpendingByCategory(transactions), [transactions]);

  const totalSpent = spendingByCategory.reduce((s, x) => s + x.value, 0);

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
  const avgMonthlyIncome = months > 0 ? totalIncome / months : 0;
  const avgMonthlyExpenses = months > 0 ? totalExpenses / months : 0;
  const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Analytics"
        description="Financial insights and trends"
        actions={
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
        }
      />

      {/* KPI row — derived from real transactions, no fake trends */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Avg Monthly Income"
          value={formatCurrency(avgMonthlyIncome)}
          icon={TrendingUp}
          iconColor="bg-success"
        />
        <KpiCard
          title="Avg Monthly Expenses"
          value={formatCurrency(avgMonthlyExpenses)}
          icon={TrendingDown}
          iconColor="bg-destructive"
        />
        <KpiCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          icon={Target}
          iconColor="bg-primary"
        />
        <KpiCard
          title="Net Balance"
          value={formatCurrency(summary?.balance ?? 0)}
          icon={Award}
          iconColor="bg-cyan-500"
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
            {cashFlowData.some(d => d.income > 0 || d.expenses > 0) ? (
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
                  <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[240px] items-center justify-center text-sm text-muted-foreground">
                No transaction data for this period
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>By category this period</CardDescription>
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
                        <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} stroke="transparent" />
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
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color || COLORS[i % COLORS.length] }} />
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
                No spending data for this period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Net worth + top categories */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Cumulative Balance</CardTitle>
            <CardDescription>Running balance over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            {netWorthData.some(d => d.value !== 0) ? (
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
                    name="Balance"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#netGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
                No data for this period
              </div>
            )}
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
                          style={{ width: `${pct}%`, backgroundColor: d.color || COLORS[i % COLORS.length] }}
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
