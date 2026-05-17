'use client';

import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  type?: 'generic' | 'network' | 'auth';
  className?: string;
}

export function ErrorState({
  title,
  message,
  onRetry,
  type = 'generic',
  className,
}: ErrorStateProps) {
  const config = {
    generic: {
      icon: AlertTriangle,
      iconClass: 'text-warning',
      bgClass: 'bg-warning/10',
      defaultTitle: 'Something went wrong',
      defaultMessage: 'An unexpected error occurred. Please try again.',
    },
    network: {
      icon: WifiOff,
      iconClass: 'text-muted-foreground',
      bgClass: 'bg-muted',
      defaultTitle: 'Connection error',
      defaultMessage: 'Unable to connect. Check your internet connection and try again.',
    },
    auth: {
      icon: AlertTriangle,
      iconClass: 'text-destructive',
      bgClass: 'bg-destructive/10',
      defaultTitle: 'Authentication error',
      defaultMessage: 'Your session has expired. Please sign in again.',
    },
  };

  const { icon: Icon, iconClass, bgClass, defaultTitle, defaultMessage } = config[type];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed px-8 py-16 text-center',
        className,
      )}
    >
      <div className={cn('mb-4 flex h-14 w-14 items-center justify-center rounded-xl', bgClass)}>
        <Icon className={cn('h-7 w-7', iconClass)} />
      </div>
      <h3 className="text-base font-semibold">{title ?? defaultTitle}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {message ?? defaultMessage}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-6 gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}

export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}
