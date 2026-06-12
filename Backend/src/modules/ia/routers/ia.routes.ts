import { Router } from 'express';
import { IAController } from '../application/controllers/ia.controller';
import { isIaAuthenticated } from '../infrastructure/middlewares/ia-auth.middleware';

const router = Router();

// Middleware central para todas estas rutas
router.use(isIaAuthenticated);

router.post('/ingresos', IAController.registerIncome);
router.post('/gastos', IAController.registerExpense);
router.get('/categorias', IAController.getCategories);
router.get('/deudas', IAController.getDebtsStatus);
router.get('/usuario', IAController.getUserInfo);

export default router;
