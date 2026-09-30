import { Router } from 'express';
import {
  createExpense,
  deleteExpense,
  getExpense,
  getExpenses,
  updateExpense,
} from '../controllers/expenseController.js';

const router = Router();

router.route('/').post(createExpense).get(getExpenses);
router.route('/:id').get(getExpense).put(updateExpense).delete(deleteExpense);

export default router;
