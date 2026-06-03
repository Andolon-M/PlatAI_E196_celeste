import { Router } from 'express';
import { CategoriesController } from '../application/controllers/categories.controller';
import { CategoriesValidator } from '../application/validators/categories.validator';
import { isAuthenticated, isAuthorized } from '../../../shared/infrastructure/middlewares/auth.middleware';
import { validateRequest } from '../../../shared/application/validators/validation.middleware';

const router = Router();

router.get(
  '/',
  isAuthenticated,
  isAuthorized('movimientos', 'read'), // Mapeado bajo el recurso movimientos para consistencia con seeders
  CategoriesController.getCategories
);

router.get(
  '/:id',
  isAuthenticated,
  isAuthorized('movimientos', 'read'),
  CategoriesValidator.deleteCategory(),
  validateRequest,
  CategoriesController.getCategoryById
);

router.post(
  '/',
  isAuthenticated,
  isAuthorized('movimientos', 'create'),
  CategoriesValidator.createCategory(),
  validateRequest,
  CategoriesController.createCategory
);

router.put(
  '/:id',
  isAuthenticated,
  isAuthorized('movimientos', 'update'),
  CategoriesValidator.updateCategory(),
  validateRequest,
  CategoriesController.updateCategory
);

router.delete(
  '/:id',
  isAuthenticated,
  isAuthorized('movimientos', 'delete'),
  CategoriesValidator.deleteCategory(),
  validateRequest,
  CategoriesController.deleteCategory
);

export default router;
