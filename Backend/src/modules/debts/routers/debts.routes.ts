import { Router } from 'express';
import { DebtsController } from '../application/controllers/debts.controller';
import { DebtsValidator } from '../application/validators/debts.validator';
import { isAuthenticated, isAuthorized } from '../../../shared/infrastructure/middlewares/auth.middleware';
import { validateRequest } from '../../../shared/application/validators/validation.middleware';

const router = Router();

// --- Deudas y Préstamos CRUD ---
router.get(
  '/',
  isAuthenticated,
  isAuthorized('deudas_prestamos', 'read'),
  DebtsController.getDebts
);

router.get(
  '/:id',
  isAuthenticated,
  isAuthorized('deudas_prestamos', 'read'),
  DebtsValidator.getDebtById(),
  validateRequest,
  DebtsController.getDebtById
);

router.post(
  '/',
  isAuthenticated,
  isAuthorized('deudas_prestamos', 'create'),
  DebtsValidator.createDebt(),
  validateRequest,
  DebtsController.createDebt
);

router.put(
  '/:id',
  isAuthenticated,
  isAuthorized('deudas_prestamos', 'update'),
  DebtsValidator.updateDebt(),
  validateRequest,
  DebtsController.updateDebt
);

router.delete(
  '/:id',
  isAuthenticated,
  isAuthorized('deudas_prestamos', 'delete'),
  DebtsValidator.deleteDebt(),
  validateRequest,
  DebtsController.deleteDebt
);

// --- Abonos a Deudas ---
router.post(
  '/:id/payments',
  isAuthenticated,
  isAuthorized('deudas_prestamos', 'create'),
  DebtsValidator.createPayment(),
  validateRequest,
  DebtsController.createPayment
);

router.get(
  '/:id/payments',
  isAuthenticated,
  isAuthorized('deudas_prestamos', 'read'),
  DebtsValidator.getDebtById(), // Reusa validación de id de deuda
  validateRequest,
  DebtsController.getPayments
);

router.delete(
  '/payments/:paymentId',
  isAuthenticated,
  isAuthorized('deudas_prestamos', 'delete'),
  DebtsValidator.deletePayment(),
  validateRequest,
  DebtsController.deletePayment
);

export default router;
