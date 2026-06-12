import { body, param, query } from 'express-validator';
import { TipoCategoria } from '@prisma/client';

export class CategoriesValidator {
  static createCategory() {
    return [
      body('nombre')
        .notEmpty()
        .withMessage('El nombre de la categoría es requerido')
        .isLength({ max: 80 })
        .withMessage('El nombre de la categoría debe tener máximo 80 caracteres')
        .trim(),

      body('tipo')
        .notEmpty()
        .withMessage('El tipo de categoría es requerido')
        .isIn(Object.values(TipoCategoria))
        .withMessage(`El tipo de categoría debe ser uno de los siguientes: ${Object.values(TipoCategoria).join(', ')}`),

      body('icono')
        .optional()
        .isLength({ max: 50 })
        .withMessage('El nombre del icono debe tener máximo 50 caracteres')
        .trim(),

      body('color')
        .optional()
        .isLength({ max: 20 })
        .withMessage('El color debe tener máximo 20 caracteres')
        .trim()
    ];
  }

  static updateCategory() {
    return [
      param('id')
        .isNumeric()
        .withMessage('El ID de la categoría debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID debe ser un número positivo');
          }
          return true;
        }),

      body('nombre')
        .optional()
        .isLength({ max: 80 })
        .withMessage('El nombre debe tener máximo 80 caracteres')
        .trim(),

      body('tipo')
        .optional()
        .isIn(Object.values(TipoCategoria))
        .withMessage(`El tipo de categoría debe ser uno de los siguientes: ${Object.values(TipoCategoria).join(', ')}`),

      body('icono')
        .optional()
        .isLength({ max: 50 })
        .withMessage('El nombre del icono debe tener máximo 50 caracteres')
        .trim(),

      body('color')
        .optional()
        .isLength({ max: 20 })
        .withMessage('El color debe tener máximo 20 caracteres')
        .trim(),

      body('estado')
        .optional()
        .isInt({ min: 0, max: 1 })
        .withMessage('El estado debe ser 0 (inactiva) o 1 (activa)')
        .toInt()
    ];
  }

  static deleteCategory() {
    return [
      param('id')
        .isNumeric()
        .withMessage('El ID de la categoría debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID debe ser un número positivo');
          }
          return true;
        })
    ];
  }
}
