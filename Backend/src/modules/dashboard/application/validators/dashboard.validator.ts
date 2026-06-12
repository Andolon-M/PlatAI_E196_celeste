import { query } from 'express-validator';

export class DashboardValidator {
  static getSummary() {
    return [
      query('fecha_inicio')
        .optional()
        .isISO8601()
        .withMessage('La fecha de inicio debe ser un formato ISO 8601 válido (ej: 2026-06-01)'),

      query('fecha_fin')
        .optional()
        .isISO8601()
        .withMessage('La fecha de fin debe ser un formato ISO 8601 válido (ej: 2026-06-30)')
    ];
  }
}
