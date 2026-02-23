/**
 * Utilidades para manejo de BigInt en serialización/deserialización
 */

/**
 * Convierte BigInt a string para serialización JSON
 * @param obj - Objeto que puede contener BigInt
 * @returns Objeto con BigInt convertidos a string
 */
export function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => serializeBigInt(item));
  }
  
  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const key in obj) {
      serialized[key] = serializeBigInt(obj[key]);
    }
    return serialized;
  }
  
  return obj;
}

/**
 * Convierte string a BigInt para deserialización
 * @param obj - Objeto que puede contener strings que representan BigInt
 * @param fields - Campos específicos que deben convertirse a BigInt (opcional)
 * @returns Objeto con strings convertidos a BigInt
 */
export function deserializeBigInt(obj: any, fields?: string[]): any {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => deserializeBigInt(item, fields));
  }
  
  if (typeof obj === 'object') {
    const deserialized: any = {};
    for (const key in obj) {
      if (fields && fields.includes(key)) {
        // Convertir campos específicos a BigInt
        if (typeof obj[key] === 'string' && /^\d+$/.test(obj[key])) {
          deserialized[key] = BigInt(obj[key]);
        } else {
          deserialized[key] = obj[key];
        }
      } else if (!fields) {
        // Convertir automáticamente campos que parecen IDs
        if (typeof obj[key] === 'string' && /^\d+$/.test(obj[key]) && 
            (key.includes('id') || key.includes('Id') || key.includes('ID'))) {
          deserialized[key] = BigInt(obj[key]);
        } else {
          deserialized[key] = deserializeBigInt(obj[key], fields);
        }
      } else {
        deserialized[key] = deserializeBigInt(obj[key], fields);
      }
    }
    return deserialized;
  }
  
  return obj;
}

/**
 * Middleware para serializar automáticamente las respuestas JSON
 * @param req - Request object
 * @param res - Response object
 * @param next - Next function
 */
export function bigIntSerializationMiddleware(req: any, res: any, next: any) {
  const originalJson = res.json;
  
  res.json = function(obj: any) {
    const serialized = serializeBigInt(obj);
    return originalJson.call(this, serialized);
  };
  
  next();
}

/**
 * Convierte campos específicos de un objeto a BigInt
 * @param obj - Objeto a procesar
 * @param idFields - Campos que deben convertirse a BigInt
 * @returns Objeto con campos convertidos
 */
export function convertToBigInt(obj: any, idFields: string[] = ['id', 'user_id', 'member_id', 'ministry_id', 'event_id', 'role_id']): any {
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

/**
 * Convierte campos específicos de un objeto a string
 * @param obj - Objeto a procesar
 * @param idFields - Campos que deben convertirse a string
 * @returns Objeto con campos convertidos
 */
export function convertToString(obj: any, idFields: string[] = ['id', 'user_id', 'member_id', 'ministry_id', 'event_id', 'role_id']): any {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertToString(item, idFields));
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      if (idFields.includes(key) && typeof obj[key] === 'bigint') {
        converted[key] = obj[key].toString();
      } else {
        converted[key] = convertToString(obj[key], idFields);
      }
    }
    return converted;
  }
  
  return obj;
}
