import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

type Target = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join('.') || 'value';
        errors[key] = errors[key] ? [...errors[key], e.message] : [e.message];
      });
      return next(AppError.badRequest('Validation failed', errors));
    }
    req[target] = result.data;
    next();
  };
}
