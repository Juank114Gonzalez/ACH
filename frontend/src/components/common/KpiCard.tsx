import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
  className?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  iconColor = 'bg-primary',
  trend,
  trendLabel,
  loading,
  className,
}: KpiCardProps) {
  if (loading) {
    return (
      <div className={cn('rounded-xl border bg-card p-6 shadow-sm', className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </div>
    );
  }

  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'group rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight">{value}</p>
          {trend !== undefined && (
            <div
              className={cn(
                'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                isPositive && 'bg-success/10 text-success',
                isNegative && 'bg-destructive/10 text-destructive',
                !isPositive && !isNegative && 'bg-muted text-muted-foreground',
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span>
                {isPositive ? '+' : ''}{trend.toFixed(1)}%
                {trendLabel && <span className="ml-1 opacity-75">{trendLabel}</span>}
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105',
            iconColor,
          )}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}
