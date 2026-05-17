import { describe, it, expect } from 'vitest';
import { formatCurrency, getInitials, getBudgetStatus } from '../../src/lib/utils';

describe('formatCurrency', () => {
  it('formats positive numbers correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
  it('formats negative numbers correctly', () => {
    expect(formatCurrency(-500)).toBe('-$500.00');
  });
});

describe('getInitials', () => {
  it('returns initials for full name', () => {
    expect(getInitials('Juan Rodriguez')).toBe('JR');
  });
  it('returns single initial for one word', () => {
    expect(getInitials('Juan')).toBe('J');
  });
  it('limits to 2 characters', () => {
    expect(getInitials('Juan Carlos Rodriguez')).toBe('JC');
  });
});

describe('getBudgetStatus', () => {
  it('returns safe for low spending', () => {
    const { level, percentage } = getBudgetStatus(30, 100);
    expect(level).toBe('safe');
    expect(percentage).toBe(30);
  });
  it('returns warning at 80%', () => {
    expect(getBudgetStatus(80, 100).level).toBe('warning');
  });
  it('returns exceeded at 100%', () => {
    expect(getBudgetStatus(100, 100).level).toBe('exceeded');
  });
  it('returns exceeded above 100%', () => {
    expect(getBudgetStatus(150, 100).level).toBe('exceeded');
  });
  it('handles zero limit', () => {
    expect(getBudgetStatus(50, 0).percentage).toBe(0);
  });
});
