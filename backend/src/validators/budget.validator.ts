import { z } from 'zod';

export const createBudgetSchema = z.object({
  categoryId: z.string().cuid('Invalid category ID'),
  amount: z.number().positive('Amount must be positive').multipleOf(0.01),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

export const updateBudgetSchema = createBudgetSchema.partial();

export const budgetQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2020).max(2100).optional(),
});
