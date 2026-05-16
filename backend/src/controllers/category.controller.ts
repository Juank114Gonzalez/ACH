import type { Request, Response, NextFunction } from 'express';
import { categoryService } from '../services/category.service';
import { AppError } from '../utils/AppError';
import type { MovementType } from '@prisma/client';

export const categoryController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const type = req.query['type'] as MovementType | undefined;
      const categories = await categoryService.getAll(req.user.sub, type);
      res.json({ success: true, data: categories });
    } catch (e) {
      next(e);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const cat = await categoryService.getById(req.params['id'] as string, req.user.sub);
      res.json({ success: true, data: cat });
    } catch (e) {
      next(e);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const cat = await categoryService.create(req.user.sub, req.body);
      res.status(201).json({ success: true, data: cat });
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const cat = await categoryService.update(req.params['id'] as string, req.user.sub, req.body);
      res.json({ success: true, data: cat });
    } catch (e) {
      next(e);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      await categoryService.delete(req.params['id'] as string, req.user.sub);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },
};
