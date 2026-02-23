import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';
import { serializeBigInt } from '../../../../shared/infrastructure/utils/bigint.utils';

/**
 * Controlador para gestionar usuarios
 */
export class UsersController {

  /**
   * Crea un nuevo usuario
   * @param req - Request con datos del usuario
   * @param res - Response
   */
  static async createUser(req: Request, res: Response) {
    try {
      const userData = req.body;

      // Convertir role_id a bigint si existe
      if (userData.role_id) {
        userData.role_id = BigInt(userData.role_id);
      }

      // Convertir email_verified_at a Date si existe
      if (userData.email_verified_at) {
        userData.email_verified_at = new Date(userData.email_verified_at);
      }

      const result = await UsersService.createUser(userData);

      if (result.success) {
        return res.status(201).json({
          status: 201,
          message: result.message,
          data: serializeBigInt(result.data)
        });
      } else {
        return res.status(400).json({
          status: 400,
          message: result.message,
          data: result.data
        });
      }
    } catch (error) {
      console.error('Error en createUser controller:', error);
      return res.status(500).json({
        status: 500,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene todos los usuarios con paginación o un usuario específico
   * @param req - Request con filtros opcionales
   * @param res - Response
   */
  static async getAllUsers(req: Request, res: Response) {
    try {
      const filters = {
        id: req.query.id ? BigInt(req.query.id as string) : undefined,
        email: req.query.email as string,
        role_id: req.query.role_id ? BigInt(req.query.role_id as string) : undefined,
        has_profile: req.query.has_profile === 'true' ? true : req.query.has_profile === 'false' ? false : undefined,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined
      };

      const result = await UsersService.getAllUsers(filters);

      if (result.success) {
        return res.status(200).json({
          status: 200,
          message: result.message,
          data: serializeBigInt(result.data)
        });
      } else {
        // Si se buscó por ID o email y no se encontró, retornar 404
        const statusCode = (filters.id || filters.email) ? 404 : 400;
        return res.status(statusCode).json({
          status: statusCode,
          message: result.message,
          error: result.error,
          data: result.data
        });
      }
    } catch (error) {
      console.error('Error en getAllUsers controller:', error);
      return res.status(500).json({
        status: 500,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }


  /**
   * Actualiza un usuario
   * @param req - Request con ID del usuario y datos a actualizar
   * @param res - Response
   */
  static async updateUser(req: Request, res: Response) {
    try {
      const userId = BigInt(req.params.id);
      const userData = req.body;

      // Convertir role_id a bigint si existe
      if (userData.role_id) {
        userData.role_id = BigInt(userData.role_id);
      }

      // Convertir email_verified_at a Date si existe
      if (userData.email_verified_at) {
        userData.email_verified_at = new Date(userData.email_verified_at);
      }

      const result = await UsersService.updateUser(userId, userData);

      if (result.success) {
        return res.status(200).json({
          status: 200,
          message: result.message,
          data: serializeBigInt(result.data)
        });
      } else {
        return res.status(400).json({
          status: 400,
          message: result.message,
          data: result.data
        });
      }
    } catch (error) {
      console.error('Error en updateUser controller:', error);
      return res.status(500).json({
        status: 500,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Elimina un usuario
   * @param req - Request con ID del usuario
   * @param res - Response
   */
  static async deleteUser(req: Request, res: Response) {
    try {
      const userId = BigInt(req.params.id);

      const result = await UsersService.deleteUser(userId);

      if (result.success) {
        return res.status(200).json({
          status: 200,
          message: result.message,
          data: serializeBigInt(result.data)
        });
      } else {
        return res.status(404).json({
          status: 404,
          message: result.message,
          data: result.data
        });
      }
    } catch (error) {
      console.error('Error en deleteUser controller:', error);
      return res.status(500).json({
        status: 500,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  /**
   * Obtiene estadísticas de usuarios (generales o específicas)
   * @param req - Request con filtros opcionales (id o email)
   * @param res - Response
   */
  static async getUserStats(req: Request, res: Response) {
    try {
      const filters = {
        id: req.query.id ? BigInt(req.query.id as string) : undefined,
        email: req.query.email as string
      };

      // Si se proporciona id o email, obtener estadísticas específicas
      if (filters.id || filters.email) {
        let result;
        
        if (filters.id) {
          result = await UsersService.getUserDetailedStats(filters.id);
        } else if (filters.email) {
          // Primero obtener el usuario por email
          const userResult = await UsersService.getUserByEmail(filters.email);
          if (!userResult.success || !userResult.data) {
            return res.status(404).json({
              status: 404,
              message: 'Usuario no encontrado',
              data: null
            });
          }
          result = await UsersService.getUserDetailedStats(BigInt(userResult.data.id));
        }

        if (result && result.success) {
          return res.status(200).json({
            status: 200,
            message: result.message,
            data: serializeBigInt(result.data)
          });
        } else {
          return res.status(404).json({
            status: 404,
            message: result?.message || 'Usuario no encontrado',
            data: null
          });
        }
      }

      // Si no se proporcionan filtros, obtener estadísticas generales
      const result = await UsersService.getUserStats();

      if (result.success) {
        return res.status(200).json({
          status: 200,
          message: result.message,
          data: serializeBigInt(result.data)
        });
      } else {
        return res.status(400).json({
          status: 400,
          message: result.message,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error en getUserStats controller:', error);
      return res.status(500).json({
        status: 500,
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
}

