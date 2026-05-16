import { Router } from 'express';
import { budgetController } from '../controllers/budget.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createBudgetSchema,
  updateBudgetSchema,
  budgetQuerySchema,
} from '../validators/budget.validator';

const router = Router();

router.use(authenticate);

router.get('/', validate(budgetQuerySchema, 'query'), budgetController.getAll);
router.get('/alerts', budgetController.getAlerts);
router.get('/:id', budgetController.getById);
router.post('/', validate(createBudgetSchema), budgetController.create);
router.patch('/:id', validate(updateBudgetSchema), budgetController.update);
router.delete('/:id', budgetController.delete);

export default router;
