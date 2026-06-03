import { body, param, query } from 'express-validator';
import { TipoMovimiento, MetodoPago } from '@prisma/client';

export class TransactionsValidator {
  static createTransaction() {
    return [
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

      body('id_categoria')
        .notEmpty()
        .withMessage('El ID de la categoría es requerido')
        .isNumeric()
        .withMessage('El ID de la categoría debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID de la categoría debe ser positivo');
          }
          return true;
        }),

      body('tipo')
        .notEmpty()
        .withMessage('El tipo de movimiento es requerido')
        .isIn(Object.values(TipoMovimiento))
        .withMessage(`El tipo debe ser: ${Object.values(TipoMovimiento).join(', ')}`),

      body('monto')
        .notEmpty()
        .withMessage('El monto es requerido')
        .isFloat({ gt: 0 })
        .withMessage('El monto debe ser un número positivo mayor que cero')
        .toFloat(),

      body('descripcion')
        .notEmpty()
        .withMessage('La descripción es requerida')
        .isLength({ max: 255 })
        .withMessage('La descripción debe tener máximo 255 caracteres')
        .trim(),

      body('fecha')
        .notEmpty()
        .withMessage('La fecha es requerida')
        .isISO8601()
        .withMessage('La fecha debe ser un formato de fecha ISO 8601 válido')
        .toDate(),

      body('metodo_pago')
        .notEmpty()
        .withMessage('El método de pago es requerido')
        .isIn(Object.values(MetodoPago))
        .withMessage(`El método de pago debe ser uno de los siguientes: ${Object.values(MetodoPago).join(', ')}`),

      body('nota')
        .optional()
        .trim(),

      body('origen_ia')
        .optional()
        .isInt({ min: 0, max: 1 })
        .withMessage('El campo origen_ia debe ser 0 o 1')
        .toInt()
    ];
  }

  static updateTransaction() {
    return [
      param('id')
        .isNumeric()
        .withMessage('El ID del movimiento debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID debe ser un número positivo');
          }
          return true;
        }),

      body('id_cuenta')
        .optional()
        .isNumeric()
        .withMessage('El ID de la cuenta debe ser numérico')
        .custom((value) => {
          if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
            throw new Error('El ID de la cuenta debe ser positivo');
          }
          return true;
        }),

      body('id_categoria')
        .optional()
        .isNumeric()
        .withMessage('El ID de la categoría debe ser numérico')
        .custom((value) => {
          if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
            throw new Error('El ID de la categoría debe ser positivo');
          }
          return true;
        }),

      body('tipo')
        .optional()
        .isIn(Object.values(TipoMovimiento))
        .withMessage(`El tipo debe ser: ${Object.values(TipoMovimiento).join(', ')}`),

      body('monto')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('El monto debe ser un número positivo mayor que cero')
        .toFloat(),

      body('descripcion')
        .optional()
        .isLength({ max: 255 })
        .withMessage('La descripción debe tener máximo 255 caracteres')
        .trim(),

      body('fecha')
        .optional()
        .isISO8601()
        .withMessage('La fecha debe ser un formato de fecha ISO 8601 válido')
        .toDate(),

      body('metodo_pago')
        .optional()
        .isIn(Object.values(MetodoPago))
        .withMessage(`El método de pago debe ser uno de los siguientes: ${Object.values(MetodoPago).join(', ')}`),

      body('nota')
        .optional()
        .trim(),

      body('origen_ia')
        .optional()
        .isInt({ min: 0, max: 1 })
        .withMessage('El campo origen_ia debe ser 0 o 1')
        .toInt()
    ];
  }

  static deleteTransaction() {
    return [
      param('id')
        .isNumeric()
        .withMessage('El ID del movimiento debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID debe ser un número positivo');
          }
          return true;
        })
    ];
  }

  static createTransfer() {
    return [
      body('id_cuenta_origen')
        .notEmpty()
        .withMessage('La cuenta de origen es requerida')
        .isNumeric()
        .withMessage('El ID de la cuenta de origen debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID de la cuenta de origen debe ser positivo');
          }
          return true;
        }),

      body('id_cuenta_destino')
        .notEmpty()
        .withMessage('La cuenta de destino es requerida')
        .isNumeric()
        .withMessage('El ID de la cuenta de destino debe ser numérico')
        .custom((value, { req }) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID de la cuenta de destino debe ser positivo');
          }
          if (Number(value) === Number(req.body.id_cuenta_origen)) {
            throw new Error('La cuenta de origen y destino deben ser distintas');
          }
          return true;
        }),

      body('monto')
        .notEmpty()
        .withMessage('El monto es requerido')
        .isFloat({ gt: 0 })
        .withMessage('El monto a transferir debe ser un número positivo mayor que cero')
        .toFloat(),

      body('fecha_transferencia')
        .notEmpty()
        .withMessage('La fecha de transferencia es requerida')
        .isISO8601()
        .withMessage('La fecha debe ser un formato de fecha ISO 8601 válido')
        .toDate(),

      body('nota')
        .optional()
        .trim()
    ];
  }

  static getTransactionsFilters() {
    return [
      query('id_cuenta')
        .optional()
        .isNumeric()
        .customSanitizer(value => BigInt(value)),

      query('id_categoria')
        .optional()
        .isNumeric()
        .customSanitizer(value => BigInt(value)),

      query('tipo')
        .optional()
        .isIn(Object.values(TipoMovimiento)),

      query('startDate')
        .optional()
        .isISO8601()
        .toDate(),

      query('endDate')
        .optional()
        .isISO8601()
        .toDate(),

      query('search')
        .optional()
        .trim(),

      query('page')
        .optional()
        .isInt({ min: 1 })
        .toInt(),

      query('pageSize')
        .optional()
        .isInt({ min: 1, max: 100 })
        .toInt()
    ];
  }
}
