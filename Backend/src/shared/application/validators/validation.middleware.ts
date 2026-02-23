import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

/**
 * Middleware que verifica si hay errores de validación de express-validator
 * y envía una respuesta de error si los hay
 * @param req - Solicitud HTTP
 * @param res - Respuesta HTTP
 * @param next - Función para continuar al siguiente middleware
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 400,
      message: "Error en la validación de datos",
      data: { errors: errors.array() }
    });
  }
  next();
}; 