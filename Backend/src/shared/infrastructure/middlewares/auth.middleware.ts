import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPermissionsRepository, UserPermission, UserRole } from '../repositories/user-permissions.repository';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_change_this';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

// Extender la interfaz Request para incluir el user con la información necesaria
declare global {
  namespace Express {
    interface User {
      userId: string;
      email: string;
      role: {
        id: string;
        name: string;
      } | null;
      permissions: {
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
    
    // Consultar el usuario completo con roles y permisos
    const userWithPermissions = await UserPermissionsRepository.getUserWithPermissions(BigInt(decoded.userId));
    if (!userWithPermissions) {
      return res.status(403).json({
        status: 403,
        message: 'Usuario no encontrado',
        data: {
          error: 'El usuario no existe en el sistema'
        }
      });
    }

    // Construir el objeto de usuario con la información necesaria incluyendo permisos
    const userResponse = {
      userId: BigInt(userWithPermissions.id).toString(),
      email: userWithPermissions.email,
      role: userWithPermissions.role ? {
        id: BigInt(userWithPermissions.role.id).toString(),
        name: userWithPermissions.role.name
      } : null,
      permissions: userWithPermissions.permissions.map(permission => ({
        id: BigInt(permission.id).toString(),
        resource: permission.resource,
        action: permission.action,
        type: permission.type
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
 * Middleware para verificar si un usuario tiene permisos para ejecutar una acción en un recurso
 * @param resource - Nombre del recurso (ej: 'users', 'roles', 'permissions')
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

      // Verificar si el usuario tiene el permiso específico
      const hasPermission = req.user.permissions.some(permission => 
        permission.resource === resource && 
        permission.action === action && 
        permission.type === 0
      );

      if (!hasPermission) {
        return res.status(403).json({
          status: 403,
          message: 'Acceso denegado',
          data: {
            error: `No tienes permisos para ${action} ${resource}`,
            required_permission: `${resource}.${action}`,
            user_permissions: req.user.permissions.map(p => `${p.resource}.${p.action}`)
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
 * Middleware para verificar si un usuario tiene un rol específico
 * @param roleName - Nombre del rol requerido
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

      // Verificar si el usuario tiene el rol especificado
      const hasRole = req.user.role && 
        req.user.role.name === roleName;

      if (!hasRole) {
        return res.status(403).json({
          status: 403,
          message: 'Acceso denegado',
          data: {
            error: `No tienes el rol '${roleName}'`,
            required_role: roleName,
            user_role: req.user.role?.name || 'Sin rol asignado'
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
