import { body, ValidationChain } from 'express-validator';

/**
 * Validadores para las operaciones de autenticación
 */
export class AuthValidator {
  /**
   * Validación para datos de inicio de sesión
   * @returns Array de validaciones para el inicio de sesión
   */
  static validateLoginData(): ValidationChain[] {
    return [
      body('email')
        .isEmail()
        .withMessage('El email debe tener un formato válido'),
      body('password')
        .notEmpty()
        .withMessage('La contraseña es obligatoria')
    ];
  }

  /**
   * Validación para datos de registro de usuario
   * @returns Array de validaciones para el registro
   */
  static validateRegisterData(): ValidationChain[] {
    return [
      // Campos obligatorios
      body('email')
        .isEmail()
        .withMessage('El email debe tener un formato válido'),
      body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
      
      // Campos opcionales de users
      body('google_id').optional(),
      body('image')
        .optional()
        .isURL()
        .withMessage('La URL de imagen debe ser válida'),
      body('remember_token').optional(),
      
      // Campos opcionales de perfil (user_profiles)
      body('name')
        .optional()
        .isString()
        .withMessage('El nombre debe ser texto'),
      body('last_name')
        .optional()
        .isString()
        .withMessage('El apellido debe ser texto'),
      body('phone')
        .optional()
        .isString()
        .withMessage('El teléfono debe ser texto'),
      body('autoGeneratePassword').optional().isBoolean()
    ];
  }


} 