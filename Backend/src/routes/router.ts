import { Router } from "express";
import authRoutes from "../modules/auth/routers/auth.routes";
import usersRoutes from "../modules/users/routers/users.routes";
import accountsRoutes from "../modules/transactions/routers/accounts.routes";
import categoriesRoutes from "../modules/transactions/routers/categories.routes";
import transactionsRoutes from "../modules/transactions/routers/transactions.routes";

const router = Router();

// Rutas de autenticación
router.use("/auth", authRoutes);

// Rutas de usuarios
router.use("/users", usersRoutes);

// Rutas Financieras: Cuentas, Categorías y Transacciones
router.use("/accounts", accountsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/transactions", transactionsRoutes);

export default router;
 