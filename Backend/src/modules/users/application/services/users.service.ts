import { UsersRepository } from '../../infrastructure/repositories/users.repository';
import { pagination } from '../../../../shared/utils/pagination';
import * as bcrypt from 'bcrypt';
import { sendTemplatedEmail } from '../../../../shared/infrastructure/mailers';
import { environment  } from '../../../../config/enviroment';

/**
 * Servicio para gestionar usuarios
 */
export class UsersService {

  /**
   * Crea un nuevo usuario
   * @param userData - Datos del usuario
   * @returns Resultado de la creación
   */
  static async createUser(userData: {
    email: string;
    password?: string;
    google_id?: string;
    image?: string;
    role_id?: bigint;
    email_verified_at?: Date;
  }) {
    try {
      // Verificar que el email no exista
      const emailExists = await UsersRepository.emailExists(userData.email);
      if (emailExists) {
        return {
          success: false,
          message: 'Ya existe un usuario con ese email',
          data: null
        };
      }

      // Hash de la contraseña si se proporciona
      let hashedPassword = userData.password;
      if (userData.password) {
        hashedPassword = await bcrypt.hash(userData.password, 10);
      }

      // Crear el usuario
      const user = await UsersRepository.createUser({
        ...userData,
        password: hashedPassword
      });

      // No retornar la contraseña
      const { password, ...userWithoutPassword } = user as any;
      await sendTemplatedEmail({
        to: user.email,
        subject: 'Bienvenido a myApp',
        contentText: [
          'Tu cuenta ha sido creada exitosamente.',
          '',
          'Credenciales de acceso:',
          `- Email: ${user.email}`,
          `- Contraseña temporal: ${userData.password}`,
          '',
          'Te recomendamos cambiar tu contraseña después del primer inicio de sesión.',
          '',
          '{{ACTION_BUTTON}}',
        ].join('\n'),
        action: {
          title: 'Iniciar sesión',
          url: `${environment.baseUrl}/login`,
        },
      });
      return {
        success: true,
        message: 'Usuario creado exitosamente',
        data: userWithoutPassword
      };
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return {
        success: false,
        message: 'Error al crear el usuario',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene todos los usuarios con paginación o un usuario específico
   * @param filters - Filtros opcionales
   * @returns Lista de usuarios paginados o un usuario específico
   */
  static async getAllUsers(filters?: {
    id?: bigint;
    email?: string;
    role_id?: bigint;
    has_profile?: boolean;
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    try {
      // Si se busca por ID o email, retornar sin paginación
      if (filters?.id || filters?.email) {
        const user = await UsersRepository.getAllUsers({
          id: filters.id,
          email: filters.email
        });
        
        if (!user) {
          return {
            success: false,
            message: 'Usuario no encontrado',
            data: null
          };
        }

        // No retornar la contraseña
        const { password, ...userWithoutPassword } = user as any;

        return {
          success: true,
          message: 'Usuario obtenido exitosamente',
          data: userWithoutPassword
        };
      }

      // Valores por defecto para paginación
      const page = filters?.page || 1;
      const pageSize = filters?.pageSize || 20;
      const offset = (page - 1) * pageSize;

      // Obtener datos con conteo
      const result = await UsersRepository.getAllUsers({
        role_id: filters?.role_id,
        has_profile: filters?.has_profile,
        search: filters?.search,
        limit: pageSize,
        offset: offset
      });

      // Aplicar paginación
      const paginatedData = await pagination(
        { rows: result.rows, count: result.count },
        pageSize,
        page
      );

      return {
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: paginatedData
      };
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return {
        success: false,
        message: 'Error al obtener usuarios',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene un usuario por email
   * @param email - Email del usuario
   * @returns Usuario encontrado
   * @private Método usado internamente por getUserStats
   */
  static async getUserByEmail(email: string) {
    try {
      const user = await UsersRepository.getUserByEmail(email);
      
      if (!user) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          data: null
        };
      }

      // No retornar la contraseña
      const { password, ...userWithoutPassword } = user as any;

      return {
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: userWithoutPassword
      };
    } catch (error) {
      console.error('Error al obtener usuario por email:', error);
      return {
        success: false,
        message: 'Error al obtener el usuario',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Actualiza un usuario
   * @param userId - ID del usuario
   * @param userData - Datos a actualizar
   * @returns Resultado de la actualización
   */
  static async updateUser(userId: bigint, userData: {
    email?: string;
    password?: string;
    google_id?: string;
    image?: string;
    role_id?: bigint;
    email_verified_at?: Date;
  }) {
    try {
      // Verificar que el usuario existe
      const userExists = await UsersRepository.userExists(userId);
      if (!userExists) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          data: null
        };
      }

      // Verificar que el email no exista (si se está actualizando)
      if (userData.email) {
        const emailExists = await UsersRepository.emailExists(userData.email, userId);
        if (emailExists) {
          return {
            success: false,
            message: 'Ya existe un usuario con ese email',
            data: null
          };
        }
      }

      // Hash de la contraseña si se proporciona
      let hashedPassword = userData.password;
      if (userData.password) {
        hashedPassword = await bcrypt.hash(userData.password, 10);
      }

      // Actualizar el usuario
      const updatedUser = await UsersRepository.updateUser(userId, {
        ...userData,
        password: hashedPassword
      });

      // No retornar la contraseña
      const { password, ...userWithoutPassword } = updatedUser as any;

      return {
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: userWithoutPassword
      };
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return {
        success: false,
        message: 'Error al actualizar el usuario',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Elimina un usuario
   * @param userId - ID del usuario
   * @returns Resultado de la eliminación
   */
  static async deleteUser(userId: bigint) {
    try {
      // Verificar que el usuario existe
      const userExists = await UsersRepository.userExists(userId);
      if (!userExists) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          data: null
        };
      }

      // Eliminar el usuario
      await UsersRepository.deleteUser(userId);

      return {
        success: true,
        message: 'Usuario eliminado exitosamente',
        data: null
      };
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      return {
        success: false,
        message: 'Error al eliminar el usuario',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   * @returns Estadísticas generales
   */
  static async getUserStats() {
    try {
      const stats = await UsersRepository.getUserStats();
      
      return {
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: stats
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        success: false,
        message: 'Error al obtener estadísticas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Obtiene estadísticas detalladas de un usuario
   * @param userId - ID del usuario
   * @returns Estadísticas del usuario
   * @private Método usado internamente por getUserStats
   */
  static async getUserDetailedStats(userId: bigint) {
    try {
      // Verificar que el usuario existe
      const userExists = await UsersRepository.userExists(userId);
      if (!userExists) {
        return {
          success: false,
          message: 'Usuario no encontrado',
          data: null
        };
      }

      const stats = await UsersRepository.getUserDetailedStats(userId);
      
      return {
        success: true,
        message: 'Estadísticas del usuario obtenidas exitosamente',
        data: stats
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del usuario:', error);
      return {
        success: false,
        message: 'Error al obtener estadísticas del usuario',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

