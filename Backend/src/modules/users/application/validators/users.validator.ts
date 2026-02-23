import { body, param, query } from 'express-validator';

/**
 * Validadores para usuarios
 */
export class UsersValidator {

  /**
   * Validaciones para crear un usuario
   */
  static createUser() {
    return [
      body('email')
        .notEmpty()
        .withMessage('El email es requerido')
        .isEmail()
        .withMessage('El email debe ser válido')
        .isLength({ max: 255 })
        .withMessage('El email debe tener máximo 255 caracteres')
        .trim()
        .toLowerCase(),
      
      body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .isLength({ max: 255 })
        .withMessage('La contraseña debe tener máximo 255 caracteres'),
      
      body('google_id')
        .optional()
        .isLength({ max: 255 })
        .withMessage('El Google ID debe tener máximo 255 caracteres')
        .trim(),
      
      body('image')
        .optional()
        .isLength({ max: 255 })
        .withMessage('La URL de la imagen debe tener máximo 255 caracteres')
        .trim(),
      
      body('role_id')
        .optional()
        .isNumeric()
        .withMessage('El ID del rol debe ser numérico')
        .custom((value) => {
          if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
            throw new Error('El ID del rol debe ser un número positivo');
          }
          return true;
        }),
      
      body('email_verified_at')
        .optional()
        .isISO8601()
        .withMessage('La fecha de verificación debe ser una fecha válida')
    ];
  }

  /**
   * Validaciones para actualizar un usuario
   */
  static updateUser() {
    return [
      param('id')
        .isNumeric()
        .withMessage('El ID del usuario debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID del usuario debe ser un número positivo');
          }
          return true;
        }),
      
      body('email')
        .optional()
        .isEmail()
        .withMessage('El email debe ser válido')
        .isLength({ max: 255 })
        .withMessage('El email debe tener máximo 255 caracteres')
        .trim()
        .toLowerCase(),
      
      body('password')
        .optional()
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .isLength({ max: 255 })
        .withMessage('La contraseña debe tener máximo 255 caracteres'),
      
      body('google_id')
        .optional()
        .isLength({ max: 255 })
        .withMessage('El Google ID debe tener máximo 255 caracteres')
        .trim(),
      
      body('image')
        .optional()
        .isLength({ max: 255 })
        .withMessage('La URL de la imagen debe tener máximo 255 caracteres')
        .trim(),
      
      body('role_id')
        .optional()
        .isNumeric()
        .withMessage('El ID del rol debe ser numérico')
        .custom((value) => {
          if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
            throw new Error('El ID del rol debe ser un número positivo');
          }
          return true;
        }),
      
      body('email_verified_at')
        .optional()
        .isISO8601()
        .withMessage('La fecha de verificación debe ser una fecha válida')
    ];
  }

  /**
   * Validaciones para eliminar un usuario
   */
  static deleteUser() {
    return [
      param('id')
        .isNumeric()
        .withMessage('El ID del usuario debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID del usuario debe ser un número positivo');
          }
          return true;
        })
    ];
  }

  /**
   * Validaciones para filtros de estadísticas de usuarios
   */
  static getUserStatsFilters() {
    return [
      query('id')
        .optional()
        .isNumeric()
        .withMessage('El ID del usuario debe ser numérico')
        .custom((value) => {
          if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
            throw new Error('El ID del usuario debe ser un número positivo');
          }
          return true;
        }),
      
      query('email')
        .optional()
        .isEmail()
        .withMessage('El email debe ser válido')
        .trim()
        .toLowerCase()
    ];
  }

  /**
   * Validaciones para filtros de usuarios
   */
  static getUsersFilters() {
    return [
      query('id')
        .optional()
        .isNumeric()
        .withMessage('El ID del usuario debe ser numérico')
        .custom((value) => {
          if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
            throw new Error('El ID del usuario debe ser un número positivo');
          }
          return true;
        }),
      
      query('email')
        .optional()
        .isEmail()
        .withMessage('El email debe ser válido')
        .trim()
        .toLowerCase(),
      
      query('role_id')
        .optional()
        .isNumeric()
        .withMessage('El ID del rol debe ser numérico')
        .custom((value) => {
          if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
            throw new Error('El ID del rol debe ser un número positivo');
          }
          return true;
        }),
      
      query('has_profile')
        .optional()
        .isBoolean()
        .withMessage('El filtro has_profile debe ser booleano'),
      
      query('search')
        .optional()
        .isLength({ min: 2, max: 255 })
        .withMessage('La búsqueda debe tener entre 2 y 255 caracteres')
        .trim(),
      
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número mayor o igual a 1'),
      
      query('pageSize')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El tamaño de página debe ser un número entre 1 y 100')
    ];
  }

}

