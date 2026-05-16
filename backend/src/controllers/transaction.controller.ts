import type { Request, Response, NextFunction } from 'express';
import { transactionService } from '../services/transaction.service';
import { AppError } from '../utils/AppError';

export const transactionController = {
  async getMany(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const result = await transactionService.getMany(req.user.sub, req.query as never);
      res.json({ success: true, ...result });
    } catch (e) {
      next(e);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const tx = await transactionService.getById(req.params['id'] as string, req.user.sub);
      res.json({ success: true, data: tx });
    } catch (e) {
      next(e);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const tx = await transactionService.create(req.user.sub, req.body);
      res.status(201).json({ success: true, data: tx });
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const tx = await transactionService.update(req.params['id'] as string, req.user.sub, req.body);
      res.json({ success: true, data: tx });
    } catch (e) {
      next(e);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      await transactionService.delete(req.params['id'] as string, req.user.sub);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },

  async getSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const summary = await transactionService.getSummary(req.user.sub, startDate, endDate);
      res.json({ success: true, data: summary });
    } catch (e) {
      next(e);
    }
  },
};
