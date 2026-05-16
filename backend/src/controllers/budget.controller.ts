import type { Request, Response, NextFunction } from 'express';
import { budgetService } from '../services/budget.service';
import { AppError } from '../utils/AppError';

export const budgetController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const month = req.query['month'] as string | undefined;
      const year = req.query['year'] as string | undefined;
      const budgets = await budgetService.getAll(
        req.user.sub,
        month ? Number(month) : undefined,
        year ? Number(year) : undefined,
      );
      res.json({ success: true, data: budgets });
    } catch (e) {
      next(e);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const budget = await budgetService.getById(req.params['id'] as string, req.user.sub);
      res.json({ success: true, data: budget });
    } catch (e) {
      next(e);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const budget = await budgetService.create(req.user.sub, req.body);
      res.status(201).json({ success: true, data: budget });
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const budget = await budgetService.update(req.params['id'] as string, req.user.sub, req.body);
      res.json({ success: true, data: budget });
    } catch (e) {
      next(e);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      await budgetService.delete(req.params['id'] as string, req.user.sub);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },

  async getAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const now = new Date();
      const month = Number(req.query['month'] as string | undefined) || now.getMonth() + 1;
      const year = Number(req.query['year'] as string | undefined) || now.getFullYear();
      const alerts = await budgetService.getAlerts(req.user.sub, month, year);
      res.json({ success: true, data: alerts });
    } catch (e) {
      next(e);
    }
  },
};
