'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, Search, Menu, X, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useBudgetAlerts } from '@/hooks/useBudgets';
import { cn, formatCurrency, getGreeting, getInitials } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const breadcrumbs: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/categories': 'Categories',
  '/budgets': 'Budgets',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export function Header() {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const now = new Date();
  const { data: alerts } = useBudgetAlerts(now.getMonth() + 1, now.getFullYear());
  const [notifOpen, setNotifOpen] = useState(false);

  const alertCount = alerts?.length ?? 0;
  const currentPage = breadcrumbs[pathname] ?? '';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-sm">
      {/* Left */}
      <div className="flex items-center gap-3">
        <div>
          <p className="text-sm font-semibold">{currentPage}</p>
          <p className="text-[11px] text-muted-foreground">
            {getGreeting()}, {user?.name?.split(' ')[0]}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className={cn(
              'relative flex h-9 w-9 items-center justify-center rounded-lg border border-transparent transition-colors',
              notifOpen
                ? 'border-border bg-muted'
                : 'hover:bg-muted',
            )}
          >
            <Bell className="h-4 w-4 text-muted-foreground" />
            {alertCount > 0 && (
              <span
                className={cn(
                  'absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white',
                  alerts?.some((a) => a.level === 'exceeded')
                    ? 'bg-destructive'
                    : 'bg-warning',
                )}
              >
                {alertCount}
              </span>
            )}
          </button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-11 z-50 w-80 animate-fade-in rounded-xl border border-border bg-card shadow-xl">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <p className="text-sm font-semibold">Budget Alerts</p>
                <button onClick={() => setNotifOpen(false)}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y">
                {alertCount === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center">
                    <Bell className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No alerts this month</p>
                  </div>
                ) : (
                  alerts?.map((a) => (
                    <div key={a.budgetId} className="flex items-start gap-3 px-4 py-3">
                      <div
                        className={cn(
                          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                          a.level === 'exceeded' ? 'bg-destructive/10' : 'bg-warning/10',
                        )}
                      >
                        <AlertTriangle
                          className={cn(
                            'h-3.5 w-3.5',
                            a.level === 'exceeded' ? 'text-destructive' : 'text-warning',
                          )}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{a.categoryName}</p>
                        <p className="text-xs text-muted-foreground">
                          {a.level === 'exceeded' ? 'Budget exceeded' : 'Approaching limit'} —{' '}
                          {a.percentage}% used
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatCurrency(a.spent)} of {formatCurrency(a.limit)}
                        </p>
                      </div>
                      <Badge
                        variant={a.level === 'exceeded' ? 'destructive' : 'warning'}
                        className="shrink-0 text-[10px]"
                      >
                        {a.percentage}%
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary ring-2 ring-background">
          {getInitials(user?.name ?? 'U')}
        </div>
      </div>
    </header>
  );
}
