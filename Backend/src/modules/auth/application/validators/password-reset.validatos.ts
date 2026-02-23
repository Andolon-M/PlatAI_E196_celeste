import { body, ValidationChain } from "express-validator";

export class PasswordResetValidator {
  /**
   * Validación para solicitud de restablecimiento de contraseña
   * @returns Array de validaciones para solicitud de reset
   */
 static validatePasswordResetRequest(): ValidationChain[] {
    return [
      body('email')
        .isEmail()
        .withMessage('El email debe tener un formato válido')
    ];
  }

  /**
   * Validación para restablecimiento de contraseña
   * @returns Array de validaciones para reset de contraseña
   */
  static validatePasswordReset(): ValidationChain[] {
    return [
      body('token')
        .notEmpty()
        .withMessage('El token es obligatorio'),
      body('newPassword')
        .isLength({ min: 6 })
        .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
    ];
  }
} 