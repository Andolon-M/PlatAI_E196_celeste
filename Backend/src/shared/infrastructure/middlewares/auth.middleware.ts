import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserCapabilitiesRepository, UserCapability, UserSubscription } from '../repositories/user-capabilities.repository';
import { SessionsRepository } from '../repositories/sessions.repository';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_this';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

// Extender la interfaz Request para incluir el user con la información necesaria
declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string;
      subscription: {
        id: string;
        name: string;
        price: number;
      } | null;
      capabilities: {
        id: string;
        resource: string;
        action: string;
        type: number;
      }[];
    }
  }
}

/**
 * Middleware para verificar si un usuario está autenticado y cargar su información
 * Acepta token desde el Authorization header
 */
export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Intentar obtener token del header Authorization
    let token = req.headers.authorization?.split(' ')[1];
    
    // Si no se encontró token en el header
    if (!token) {
      return res.status(401).json({
        status: 401,
        message: 'No autenticado',
        data: {
          error: 'Token de autenticación no encontrado'
        }
      });
    }
    
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET no configurado');
    }

    const decoded = jwt.verify(token, JWT_SECRET) as Express.User;
    
    // VALIDACIÓN CRÍTICA: Verificar si la sesión está activa y vigente en la base de datos
    const isSessionActive = await SessionsRepository.checkSessionActive(BigInt(decoded.userId), token);
    if (!isSessionActive) {
      return res.status(401).json({
        status: 401,
        message: 'La sesión ha expirado o ha sido revocada, por favor inicia sesión nuevamente',
        data: {
          error: 'Sesión inactiva o revocada en la base de datos'
        }
      });
    }
    
    // Consultar el usuario completo con suscripción y capacidades
    const userWithCapabilities = await UserCapabilitiesRepository.getUserWithCapabilities(BigInt(decoded.userId));
    if (!userWithCapabilities) {
      return res.status(403).json({
        status: 403,
        message: 'Usuario no encontrado',
        data: {
          error: 'El usuario no existe en el sistema'
        }
      });
    }

    // Construir el objeto de usuario con la información necesaria incluyendo capacidades
    const userResponse = {
      userId: BigInt(userWithCapabilities.id).toString(),
      email: userWithCapabilities.email,
      subscription: userWithCapabilities.subscription ? {
        id: BigInt(userWithCapabilities.subscription.id).toString(),
        name: userWithCapabilities.subscription.name,
        price: Number(userWithCapabilities.subscription.price)
      } : null,
      capabilities: userWithCapabilities.capabilities.map(capability => ({
        id: BigInt(capability.id).toString(),
        resource: capability.resource,
        action: capability.action,
        type: capability.type
      }))
    };

    // Asignar la información del usuario a la solicitud
    req.user = userResponse;

    next();
  } catch (error) {
    console.error('Error en el middleware de autenticación:', error);
    
    // Verificar si es un error de expiración de token
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        status: 401,
        message: 'La sesión ha expirado, por favor inicia sesión nuevamente',
        data: {
          error: 'Sesión expirada'
        }
      });
    }
    
    // Verificar si es otro tipo de error de JWT
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        status: 401,
        message: 'Sesión inválida, por favor inicia sesión nuevamente',
        data: {
          error: 'Sesión inválida'
        }
      });
    }
    
    // Cualquier otro error inesperado
    res.status(500).json({
      status: 500,
      message: 'Error interno del servidor',
      data: {
        error: 'Error inesperado en la autenticación'
      }
    });
  }
};

/**
 * Middleware para verificar si un usuario tiene capacidades para ejecutar una acción en un recurso
 * @param resource - Nombre del recurso (ej: 'users', 'cuentas')
 * @param action - Acción a realizar (ej: 'create', 'read', 'update', 'delete')
 * @returns Middleware function
 */
export const isAuthorized = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          status: 401,
          message: 'No autenticado',
          data: {
            error: 'Usuario no autenticado'
          }
        });
      }

      // Verificar si el usuario tiene la capacidad específica
      const hasCapability = req.user.capabilities.some(capability => 
        capability.resource === resource && 
        capability.action === action && 
        capability.type === 0
      );

      if (!hasCapability) {
        return res.status(403).json({
          status: 403,
          message: 'Acceso denegado',
          data: {
            error: `No tienes capacidades para ${action} ${resource}`,
            required_capability: `${resource}.${action}`,
            user_capabilities: req.user.capabilities.map(c => `${c.resource}.${c.action}`)
          }
        });
      }

      next();
    } catch (error) {
      console.error('Error en el middleware de autorización:', error);
      
      return res.status(500).json({
        status: 500,
        message: 'Error interno del servidor',
        data: {
          error: 'Error inesperado en la autorización'
        }
      });
    }
  };
};

/**
 * Middleware para verificar si un usuario tiene una suscripción específica (para compatibilidad con rutas de roles)
 * @param roleName - Nombre de la suscripción/rol requerido
 * @returns Middleware function
 */
export const hasRole = (roleName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          status: 401,
          message: 'No autenticado',
          data: {
            error: 'Usuario no autenticado'
          }
        });
      }

      // Verificar si el usuario tiene la suscripción específica
      const hasSubscription = req.user.subscription && 
        req.user.subscription.name === roleName;

      if (!hasSubscription) {
        return res.status(403).json({
          status: 403,
          message: 'Acceso denegado',
          data: {
            error: `No tienes la suscripción '${roleName}'`,
            required_subscription: roleName,
            user_subscription: req.user.subscription?.name || 'Sin suscripción asignada'
          }
        });
      }

      next();
    } catch (error) {
      console.error('Error en el middleware de autorización:', error);
      
      return res.status(500).json({
        status: 500,
        message: 'Error interno del servidor',
        data: {
          error: 'Error inesperado en la autorización'
        }
      });
    }
  };
};
