import { Router } from 'express';
import { TransactionsController } from '../application/controllers/transactions.controller';
import { TransactionsValidator } from '../application/validators/transactions.validator';
import { isAuthenticated, isAuthorized } from '../../../shared/infrastructure/middlewares/auth.middleware';
import { validateRequest } from '../../../shared/application/validators/validation.middleware';

const router = Router();

// ========== RUTAS DE MOVIMIENTOS ==========

router.get(
  '/',
  isAuthenticated,
  isAuthorized('movimientos', 'read'),
  TransactionsValidator.getTransactionsFilters(),
  validateRequest,
  TransactionsController.getTransactions
);

router.get(
  '/transfers',
  isAuthenticated,
  isAuthorized('transferencias', 'read'),
  TransactionsController.getTransfers
);

router.get(
  '/:id',
  isAuthenticated,
  isAuthorized('movimientos', 'read'),
  TransactionsValidator.deleteTransaction(),
  validateRequest,
  TransactionsController.getTransactionById
);

router.post(
  '/',
  isAuthenticated,
  isAuthorized('movimientos', 'create'),
  TransactionsValidator.createTransaction(),
  validateRequest,
  TransactionsController.createTransaction
);

router.post(
  '/transfer',
  isAuthenticated,
  isAuthorized('transferencias', 'create'),
  TransactionsValidator.createTransfer(),
  validateRequest,
  TransactionsController.createTransfer
);

router.put(
  '/:id',
  isAuthenticated,
  isAuthorized('movimientos', 'update'),
  TransactionsValidator.updateTransaction(),
  validateRequest,
  TransactionsController.updateTransaction
);

router.delete(
  '/:id',
  isAuthenticated,
  isAuthorized('movimientos', 'delete'),
  TransactionsValidator.deleteTransaction(),
  validateRequest,
  TransactionsController.deleteTransaction
);

export default router;
