import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive('Amount must be positive').multipleOf(0.01),
  description: z.string().min(1).max(255).trim(),
  categoryId: z.string().cuid('Invalid category ID'),
  date: z.string().datetime().or(z.string().date()),
  notes: z.string().max(1000).optional(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionQuerySchema = z.object({
  page: z.coerce.number().positive().optional(),
  limit: z.coerce.number().positive().max(100).optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  categoryId: z.string().cuid().optional(),
  startDate: z.string().date().optional(),
  endDate: z.string().date().optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().max(100).optional(),
});
