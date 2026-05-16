import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isToday, isYesterday, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency = 'USD',
  compact = false,
): string {
  if (compact && Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, pattern = 'MMM dd, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
}

export function formatDateRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return formatDistanceToNow(d, { addSuffix: true });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getBudgetStatus(
  spent: number,
  limit: number,
): { level: 'safe' | 'warning' | 'exceeded'; percentage: number; color: string } {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const clamped = Math.round(Math.min(percentage, 100));
  if (percentage >= 100) return { level: 'exceeded', percentage: clamped, color: 'bg-destructive' };
  if (percentage >= 80) return { level: 'warning', percentage: clamped, color: 'bg-warning' };
  return { level: 'safe', percentage: clamped, color: 'bg-primary' };
}

export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
