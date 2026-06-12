import { body, param, query } from 'express-validator';
import { PrioridadMeta, EstadoMeta } from '@prisma/client';

export class SavingsGoalsValidator {
  static createGoal() {
    return [
      body('nombre')
        .notEmpty()
        .withMessage('El nombre de la meta es requerido')
        .isLength({ max: 150 })
        .withMessage('El nombre debe tener máximo 150 caracteres')
        .trim(),

      body('monto_objetivo')
        .notEmpty()
        .withMessage('El monto objetivo es requerido')
        .isFloat({ gt: 0 })
        .withMessage('El monto objetivo debe ser un número positivo mayor que cero')
        .toFloat(),

      body('fecha_limite')
        .notEmpty()
        .withMessage('La fecha límite es requerida')
        .isISO8601()
        .withMessage('La fecha límite debe ser un formato ISO 8601 válido')
        .toDate(),

      body('prioridad')
        .notEmpty()
        .withMessage('La prioridad es requerida')
        .isIn(Object.values(PrioridadMeta))
        .withMessage(`La prioridad debe ser una de las siguientes: ${Object.values(PrioridadMeta).join(', ')}`),

      body('estado')
        .optional()
        .isIn(Object.values(EstadoMeta))
        .withMessage(`El estado debe ser uno de los siguientes: ${Object.values(EstadoMeta).join(', ')}`),

      body('icono')
        .optional()
        .isLength({ max: 50 })
        .withMessage('El icono debe tener máximo 50 caracteres')
        .trim(),

      body('color')
        .optional()
        .isLength({ max: 20 })
        .withMessage('El color debe tener máximo 20 caracteres')
        .trim()
    ];
  }

  static updateGoal() {
    return [
      param('id')
        .isNumeric()
        .withMessage('El ID de la meta debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID de la meta debe ser un número positivo');
          }
          return true;
        }),

      body('nombre')
        .optional()
        .isLength({ max: 150 })
        .withMessage('El nombre debe tener máximo 150 caracteres')
        .trim(),

      body('monto_objetivo')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('El monto objetivo debe ser un número positivo mayor que cero')
        .toFloat(),

      body('fecha_limite')
        .optional()
        .isISO8601()
        .withMessage('La fecha límite debe ser un formato ISO 8601 válido')
        .toDate(),

      body('prioridad')
        .optional()
        .isIn(Object.values(PrioridadMeta))
        .withMessage(`La prioridad debe ser una de las siguientes: ${Object.values(PrioridadMeta).join(', ')}`),

      body('estado')
        .optional()
        .isIn(Object.values(EstadoMeta))
        .withMessage(`El estado debe ser uno de los siguientes: ${Object.values(EstadoMeta).join(', ')}`),

      body('icono')
        .optional()
        .isLength({ max: 50 })
        .withMessage('El icono debe tener máximo 50 caracteres')
        .trim(),

      body('color')
        .optional()
        .isLength({ max: 20 })
        .withMessage('El color debe tener máximo 20 caracteres')
        .trim()
    ];
  }

  static getGoalById() {
    return [
      param('id')
        .isNumeric()
        .withMessage('El ID debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID debe ser un número positivo');
          }
          return true;
        })
    ];
  }

  static deleteGoal() {
    return [
      param('id')
        .isNumeric()
        .withMessage('El ID debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID debe ser un número positivo');
          }
          return true;
        })
    ];
  }

  static createContribution() {
    return [
      param('id')
        .isNumeric()
        .withMessage('El ID de la meta debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID de la meta debe ser positivo');
          }
          return true;
        }),

      body('id_cuenta')
        .notEmpty()
        .withMessage('El ID de la cuenta es requerido')
        .isNumeric()
        .withMessage('El ID de la cuenta debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID de la cuenta debe ser positivo');
          }
          return true;
        }),

      body('monto')
        .notEmpty()
        .withMessage('El monto del aporte es requerido')
        .isFloat({ gt: 0 })
        .withMessage('El monto del aporte debe ser un número positivo mayor que cero')
        .toFloat(),

      body('fecha_aporte')
        .notEmpty()
        .withMessage('La fecha del aporte es requerida')
        .isISO8601()
        .withMessage('La fecha del aporte debe ser un formato ISO 8601 válido')
        .toDate(),

      body('nota')
        .optional()
        .isLength({ max: 255 })
        .withMessage('La nota debe tener máximo 255 caracteres')
        .trim()
    ];
  }

  static deleteContribution() {
    return [
      param('contributionId')
        .isNumeric()
        .withMessage('El ID del aporte debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID del aporte debe ser un número positivo');
          }
          return true;
        })
    ];
  }
}
