import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createTransactionSchema,
  updateTransactionSchema,
  transactionQuerySchema,
} from '../validators/transaction.validator';

const router = Router();

router.use(authenticate);

router.get('/', validate(transactionQuerySchema, 'query'), transactionController.getMany);
router.get('/summary', transactionController.getSummary);
router.get('/:id', transactionController.getById);
router.post('/', validate(createTransactionSchema), transactionController.create);
router.patch('/:id', validate(updateTransactionSchema), transactionController.update);
router.delete('/:id', transactionController.delete);

export default router;
