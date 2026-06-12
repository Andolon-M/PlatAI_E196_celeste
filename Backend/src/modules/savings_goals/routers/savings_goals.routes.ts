import { Router } from 'express';
import { SavingsGoalsController } from '../application/controllers/savings_goals.controller';
import { SavingsGoalsValidator } from '../application/validators/savings_goals.validator';
import { isAuthenticated, isAuthorized } from '../../../shared/infrastructure/middlewares/auth.middleware';
import { validateRequest } from '../../../shared/application/validators/validation.middleware';

const router = Router();

// --- Metas de Ahorro CRUD ---
router.get(
  '/',
  isAuthenticated,
  isAuthorized('metas_ahorro', 'read'),
  SavingsGoalsController.getGoals
);

router.get(
  '/:id',
  isAuthenticated,
  isAuthorized('metas_ahorro', 'read'),
  SavingsGoalsValidator.getGoalById(),
  validateRequest,
  SavingsGoalsController.getGoalById
);

router.post(
  '/',
  isAuthenticated,
  isAuthorized('metas_ahorro', 'create'),
  SavingsGoalsValidator.createGoal(),
  validateRequest,
  SavingsGoalsController.createGoal
);

router.put(
  '/:id',
  isAuthenticated,
  isAuthorized('metas_ahorro', 'update'),
  SavingsGoalsValidator.updateGoal(),
  validateRequest,
  SavingsGoalsController.updateGoal
);

router.delete(
  '/:id',
  isAuthenticated,
  isAuthorized('metas_ahorro', 'delete'),
  SavingsGoalsValidator.deleteGoal(),
  validateRequest,
  SavingsGoalsController.deleteGoal
);

// --- Aportes a Metas ---
router.post(
  '/:id/contributions',
  isAuthenticated,
  isAuthorized('metas_ahorro', 'create'),
  SavingsGoalsValidator.createContribution(),
  validateRequest,
  SavingsGoalsController.createContribution
);

router.get(
  '/:id/contributions',
  isAuthenticated,
  isAuthorized('metas_ahorro', 'read'),
  SavingsGoalsValidator.getGoalById(), // Reusa validación de id de meta
  validateRequest,
  SavingsGoalsController.getContributions
);

router.delete(
  '/contributions/:contributionId',
  isAuthenticated,
  isAuthorized('metas_ahorro', 'delete'),
  SavingsGoalsValidator.deleteContribution(),
  validateRequest,
  SavingsGoalsController.deleteContribution
);

export default router;
