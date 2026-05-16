import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }),
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await authService.register(req.body);
      res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
      res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: { user, accessToken: tokens.accessToken },
      });
    } catch (e) {
      next(e);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { user, tokens } = await authService.login(req.body, req);
      res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
      res.json({
        success: true,
        message: 'Login successful',
        data: { user, accessToken: tokens.accessToken },
      });
    } catch (e) {
      next(e);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rawToken =
        req.cookies?.refreshToken ?? req.body?.refreshToken;

      if (!rawToken) throw AppError.unauthorized('No refresh token provided');

      const tokens = await authService.refresh(rawToken, req);
      res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
      res.json({
        success: true,
        data: { accessToken: tokens.accessToken },
      });
    } catch (e) {
      next(e);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
      if (token) await authService.logout(token);
      res.clearCookie('refreshToken');
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (e) {
      next(e);
    }
  },

  async logoutAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      await authService.logoutAll(req.user.sub);
      res.clearCookie('refreshToken');
      res.json({ success: true, message: 'All sessions terminated' });
    } catch (e) {
      next(e);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      res.json({ success: true, data: { user: req.user } });
    } catch (e) {
      next(e);
    }
  },
};
