import { body, param, query } from 'express-validator';
import { TipoCuenta } from '@prisma/client';

export class AccountsValidator {
  static createAccount() {
    return [
      body('nombre')
        .notEmpty()
        .withMessage('El nombre de la cuenta es requerido')
        .isLength({ max: 100 })
        .withMessage('El nombre debe tener máximo 100 caracteres')
        .trim(),

      body('tipo')
        .notEmpty()
        .withMessage('El tipo de cuenta es requerido')
        .isIn(Object.values(TipoCuenta))
        .withMessage(`El tipo de cuenta debe ser uno de los siguientes: ${Object.values(TipoCuenta).join(', ')}`),

      body('saldo')
        .optional()
        .isFloat()
        .withMessage('El saldo inicial debe ser un número válido')
        .toFloat(),

      body('color')
        .optional()
        .isLength({ max: 20 })
        .withMessage('El color debe tener máximo 20 caracteres')
        .trim()
    ];
  }

  static updateAccount() {
    return [
      param('id')
        .isNumeric()
        .withMessage('El ID de la cuenta debe ser numérico')
        .custom((value) => {
          if (isNaN(Number(value)) || Number(value) <= 0) {
            throw new Error('El ID de la cuenta debe ser un número positivo');
          }
          return true;
        }),

      body('nombre')
        .optional()
        .isLength({ max: 100 })
        .withMessage('El nombre debe tener máximo 100 caracteres')
        .trim(),

      body('tipo')
        .optional()
        .isIn(Object.values(TipoCuenta))
        .withMessage(`El tipo de cuenta debe ser uno de los siguientes: ${Object.values(TipoCuenta).join(', ')}`),

      body('color')
        .optional()
        .isLength({ max: 20 })
        .withMessage('El color debe tener máximo 20 caracteres')
        .trim(),

      body('estado')
        .optional()
        .isInt({ min: 0, max: 1 })
        .withMessage('El estado debe ser 0 (archivada) o 1 (activa)')
        .toInt()
    ];
  }

  static deleteAccount() {
    return [
      param('id')
        .isNumeric()
        .withMessage('El ID de la cuenta debe ser numérico')
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
}
