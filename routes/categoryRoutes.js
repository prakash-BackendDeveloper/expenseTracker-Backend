import { Router } from 'express';
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  updateCategory,
} from '../controllers/categoryController.js';

const router = Router();

router.route('/').post(createCategory).get(getCategories);
router.route('/:id').get(getCategory).put(updateCategory).delete(deleteCategory);

export default router;
