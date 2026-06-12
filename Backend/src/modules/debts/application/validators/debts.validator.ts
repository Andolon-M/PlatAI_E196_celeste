import { body, param, query } from 'express-validator';
import { TipoDeuda, EstadoDeuda } from '@prisma/client';

export class DebtsValidator {
  static createDebt() {
    return [
      body('tipo')
        .notEmpty()
        .withMessage('El tipo de deuda es requerido')
        .isIn(Object.values(TipoDeuda))
        .withMessage(`El tipo debe ser uno de los siguientes: ${Object.values(TipoDeuda).join(', ')}`),

      body('persona_entidad')
        .notEmpty()
        .withMessage('La persona o entidad es requerida')
        .isLength({ max: 150 })
        .withMessage('La persona o entidad debe tener máximo 150 caracteres')
        .trim(),

      body('monto_total')
        .notEmpty()
        .withMessage('El monto total es requerido')
        .isFloat({ gt: 0 })
        .withMessage('El monto total debe ser un número positivo mayor que cero')
        .toFloat(),

      body('descripcion')
        .optional()
        .isString()
        .withMessage('La descripción debe ser texto')
        .trim(),

      body('fecha_vencimiento')
        .optional()
        .isISO8601()
        .withMessage('La fecha de vencimiento debe ser un formato ISO 8601 válido')
        .toDate()
    ];
  }

  static updateDebt() {
    return [
      param('id')
        .isNumeric()
        .withMessage('El ID de la deuda debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID de la deuda debe ser un número positivo');
          }
          return true;
        }),

      body('tipo')
        .optional()
        .isIn(Object.values(TipoDeuda))
        .withMessage(`El tipo debe ser uno de los siguientes: ${Object.values(TipoDeuda).join(', ')}`),

      body('persona_entidad')
        .optional()
        .isLength({ max: 150 })
        .withMessage('La persona o entidad debe tener máximo 150 caracteres')
        .trim(),

      body('monto_total')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('El monto total debe ser un número positivo mayor que cero')
        .toFloat(),

      body('descripcion')
        .optional()
        .isString()
        .withMessage('La descripción debe ser texto')
        .trim(),

      body('fecha_vencimiento')
        .optional()
        .isISO8601()
        .withMessage('La fecha de vencimiento debe ser un formato ISO 8601 válido')
        .toDate(),

      body('estado')
        .optional()
        .isIn(Object.values(EstadoDeuda))
        .withMessage(`El estado debe ser uno de los siguientes: ${Object.values(EstadoDeuda).join(', ')}`)
    ];
  }

  static getDebtById() {
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

  static deleteDebt() {
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

  static createPayment() {
    return [
      param('id')
        .isNumeric()
        .withMessage('El ID de la deuda debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID de la deuda debe ser positivo');
          }
          return true;
        }),

      body('monto_abonado')
        .notEmpty()
        .withMessage('El monto del abono es requerido')
        .isFloat({ gt: 0 })
        .withMessage('El monto del abono debe ser un número positivo mayor que cero')
        .toFloat(),

      body('fecha_abono')
        .notEmpty()
        .withMessage('La fecha del abono es requerida')
        .isISO8601()
        .withMessage('La fecha del abono debe ser un formato ISO 8601 válido')
        .toDate(),

      body('nota')
        .optional()
        .isLength({ max: 255 })
        .withMessage('La nota debe tener máximo 255 caracteres')
        .trim()
    ];
  }

  static deletePayment() {
    return [
      param('paymentId')
        .isNumeric()
        .withMessage('El ID del abono debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID del abono debe ser un número positivo');
          }
          return true;
        })
    ];
  }
}
