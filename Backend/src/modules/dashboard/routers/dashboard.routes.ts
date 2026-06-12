import { Router } from 'express';
import { DashboardController } from '../application/controllers/dashboard.controller';
import { DashboardValidator } from '../application/validators/dashboard.validator';
import { isAuthenticated } from '../../../shared/infrastructure/middlewares/auth.middleware';
import { validateRequest } from '../../../shared/application/validators/validation.middleware';

const router = Router();

router.get(
  '/',
  isAuthenticated,
  DashboardValidator.getSummary(),
  validateRequest,
  DashboardController.getSummary
);

export default router;
