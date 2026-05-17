'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from './LoadingState';
import { EmptyState } from './EmptyState';
import type { LucideIcon } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  className?: string;
  headerClassName?: string;
  render: (row: T) => React.ReactNode;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
  rowKey: (row: T) => string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  loading,
  meta,
  onPageChange,
  emptyIcon,
  emptyTitle = 'No data found',
  emptyDescription,
  onEmptyAction,
  emptyActionLabel,
  rowKey,
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn('rounded-xl border bg-card shadow-sm overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                    col.headerClassName,
                  )}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td colSpan={columns.length}>
                  <TableSkeleton rows={6} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                    action={
                      onEmptyAction && emptyActionLabel
                        ? { label: emptyActionLabel, onClick: onEmptyAction }
                        : undefined
                    }
                    className="rounded-none border-0"
                  />
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="transition-colors hover:bg-muted/30"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-6 py-4', col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && meta.total > 0 && (
        <div className="flex items-center justify-between border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium">
              {(meta.page - 1) * meta.limit + 1}–
              {Math.min(meta.page * meta.limit, meta.total)}
            </span>{' '}
            of <span className="font-medium">{meta.total}</span> results
          </p>
          {meta.totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={!meta.hasPrevPage}
                onClick={() => onPageChange?.(meta.page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(meta.page - 2, meta.totalPages - 4));
                const page = start + i;
                return (
                  <Button
                    key={page}
                    variant={page === meta.page ? 'default' : 'ghost'}
                    size="icon-sm"
                    onClick={() => onPageChange?.(page)}
                    className="text-xs"
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={!meta.hasNextPage}
                onClick={() => onPageChange?.(meta.page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
