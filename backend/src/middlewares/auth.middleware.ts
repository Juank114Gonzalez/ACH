import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing or malformed Authorization header');
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    next(AppError.unauthorized('Invalid or expired access token'));
  }
}
