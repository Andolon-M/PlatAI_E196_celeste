import { Router } from "express";
import authRoutes from "../modules/auth/routers/auth.routes";
import usersRoutes from "../modules/users/routers/users.routes";
import accountsRoutes from "../modules/accounts/routers/accounts.routes";
import categoriesRoutes from "../modules/categories/routers/categories.routes";
import transactionsRoutes from "../modules/transactions/routers/transactions.routes";
import savingsGoalsRoutes from "../modules/savings_goals/routers/savings_goals.routes";
import debtsRoutes from "../modules/debts/routers/debts.routes";
import dashboardRoutes from "../modules/dashboard/routers/dashboard.routes";
import iaRoutes from "../modules/ia/routers/ia.routes";

const router = Router();

// Rutas de autenticación
router.use("/auth", authRoutes);

// Rutas de usuarios
router.use("/users", usersRoutes);

// Rutas Financieras: Cuentas, Categorías, Transacciones, Metas de Ahorro y Deudas
router.use("/accounts", accountsRoutes);
router.use("/categories", categoriesRoutes);
router.use("/transactions", transactionsRoutes);
router.use("/savings-goals", savingsGoalsRoutes);
router.use("/debts", debtsRoutes);

// Dashboard
router.use("/dashboard", dashboardRoutes);

// Integración IA (n8n)
router.use("/ia", iaRoutes);

export default router;
 