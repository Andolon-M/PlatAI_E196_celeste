import { Router } from 'express';
import { AccountsController } from '../application/controllers/accounts.controller';
import { AccountsValidator } from '../application/validators/accounts.validator';
import { isAuthenticated, isAuthorized } from '../../../shared/infrastructure/middlewares/auth.middleware';
import { validateRequest } from '../../../shared/application/validators/validation.middleware';

const router = Router();

router.get(
  '/',
  isAuthenticated,
  isAuthorized('cuentas', 'read'),
  AccountsController.getAccounts
);

router.get(
  '/:id',
  isAuthenticated,
  isAuthorized('cuentas', 'read'),
  AccountsValidator.deleteAccount(),
  validateRequest,
  AccountsController.getAccountById
);

router.post(
  '/',
  isAuthenticated,
  isAuthorized('cuentas', 'create'),
  AccountsValidator.createAccount(),
  validateRequest,
  AccountsController.createAccount
);

router.put(
  '/:id',
  isAuthenticated,
  isAuthorized('cuentas', 'update'),
  AccountsValidator.updateAccount(),
  validateRequest,
  AccountsController.updateAccount
);

router.delete(
  '/:id',
  isAuthenticated,
  isAuthorized('cuentas', 'delete'),
  AccountsValidator.deleteAccount(),
  validateRequest,
  AccountsController.deleteAccount
);

export default router;
