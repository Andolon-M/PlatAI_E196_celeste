import { Request, Response, NextFunction } from 'express';
import { serializeBigInt } from '../utils/bigint.utils';

/**
 * Middleware para serializar automáticamente las respuestas JSON con BigInt
 * @param req - Request object
 * @param res - Response object
 * @param next - Next function
 */
export function bigIntSerializationMiddleware(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json;
  
  res.json = function(obj: any) {
    const serialized = serializeBigInt(obj);
    return originalJson.call(this, serialized);
  };
  
  next();
}

/**
 * Middleware para deserializar BigInt en el request body
 * @param req - Request object
 * @param res - Response object
 * @param next - Next function
 */
export function bigIntDeserializationMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = convertToBigInt(req.body);
  }
  
  next();
}

/**
 * Convierte campos específicos de un objeto a BigInt
 * @param obj - Objeto a procesar
 * @param idFields - Campos que deben convertirse a BigInt
 * @returns Objeto con campos convertidos
 */
function convertToBigInt(obj: any, idFields: string[] = ['id', 'user_id', 'member_id', 'ministry_id', 'event_id', 'role_id']): any {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertToBigInt(item, idFields));
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      if (idFields.includes(key) && typeof obj[key] === 'string' && /^\d+$/.test(obj[key])) {
        converted[key] = BigInt(obj[key]);
      } else {
        converted[key] = convertToBigInt(obj[key], idFields);
      }
    }
    return converted;
  }
  
  return obj;
}
