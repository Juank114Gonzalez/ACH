import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50).trim(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color')
    .default('#6366f1'),
  icon: z.string().min(1).max(50).default('tag'),
  type: z.enum(['INCOME', 'EXPENSE']),
});

export const updateCategorySchema = createCategorySchema.partial();
