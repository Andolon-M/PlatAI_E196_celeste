import { Router } from "express";
import authRoutes from "../modules/auth/routers/auth.routes";
import usersRoutes from "../modules/users/routers/users.routes";


const router = Router();

// Rutas de autenticación
router.use("/auth", authRoutes);

// Rutas de usuarios
router.use("/users", usersRoutes);


export default router; 