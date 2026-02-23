import { Router, Request, Response } from "express";
import { AuthController } from "../application/controllers/auth.controller";
import passport from "../../../shared/infrastructure/middlewares/passport.middleware";
import { isAuthenticated } from "../../../shared/infrastructure/middlewares/auth.middleware";
import { AuthValidator } from "../application/validators/auth.validator";
import { validateRequest } from "../../../shared/application/validators/validation.middleware";
import rolesPermissionsRoutes from "./roles-permissions.routes";
import { PasswordResetValidator } from "../application/validators/password-reset.validatos";
const router = Router();

router.post(
  "/login",
  AuthValidator.validateLoginData(),
  validateRequest,
  (req: Request, res: Response) => AuthController.login(req, res)
);

router.post(
  "/register",
  AuthValidator.validateRegisterData(),
  validateRequest,
  (req: Request, res: Response) => AuthController.register(req, res)
);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req: Request, res: Response) => AuthController.googleCallback(req, res)
);

router.get(
  '/me',
  isAuthenticated,
  (req: Request, res: Response) => {
    return res.status(200).json({
      status: 200,
      message: "Información del usuario obtenida correctamente",
      data: req.user 
    });
  }
);

router.post(
  '/logout',
  (req: Request, res: Response) => AuthController.logout(req, res)
);

router.post(
  '/request-reset',
  PasswordResetValidator.validatePasswordResetRequest(),
  validateRequest,
  (req: Request, res: Response) => AuthController.requestPasswordReset(req, res)
);

router.get(
  '/verify-token/:token',
  (req: Request, res: Response) => AuthController.verifyResetToken(req, res)
);

router.post(
  '/reset-password',
  PasswordResetValidator.validatePasswordReset(),
  validateRequest,
  (req: Request, res: Response) => AuthController.resetPassword(req, res)
);

// Rutas de roles y permisos (requieren autenticación)
router.use('/', isAuthenticated, rolesPermissionsRoutes);

export default router;