import { prisma } from '../../../../config/database/db';

/**
 * Repositorio para gestionar tokens de recuperación de contraseña directamente en la tabla de usuarios
 */
export class PasswordResetRepository {
  /**
   * Guarda un token de recuperación de contraseña directamente en el usuario
   * @param userId - ID del usuario
   * @param token - Token generado
   * @returns El usuario actualizado
   */
  static async saveToken(userId: bigint, token: string) {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24); // Expira en 24 horas

    return await prisma.users.update({
      where: {
        id: userId
      },
      data: {
        token_recuperacion: token,
        token_expiracion: expiry,
        fecha_modificacion: new Date()
      }
    });
  }

  /**
   * Verifica si un token es válido y no ha expirado
   * @param token - Token a verificar
   * @returns El registro del token adaptado para compatibilidad con el servicio
   */
  static async verifyToken(token: string) {
    const user = await prisma.users.findFirst({
      where: {
        token_recuperacion: token
      }
    });

    // Verificar si el usuario existe
    if (!user) {
      return null;
    }

    // Verificar si el token ha expirado
    const now = new Date();
    if (user.token_expiracion && user.token_expiracion < now) {
      // El token ha expirado, lo eliminamos
      await this.deleteToken(token);
      return null;
    }

    // Retorna estructura adaptada para compatibilidad con PasswordResetService
    return {
      token,
      created_at: user.token_expiracion,
      user: {
        id: user.id,
        email: user.email
      }
    };
  }

  /**
   * Marca un token como usado (lo elimina)
   * @param token - Token a marcar
   * @returns Resultado de la eliminación
   */
  static async markTokenAsUsed(token: string) {
    return await this.deleteToken(token);
  }

  /**
   * Elimina un token específico de recuperación limpiando los campos del usuario
   * @param token - Token a eliminar
   * @returns Resultado de la actualización
   */
  static async deleteToken(token: string) {
    return await prisma.users.updateMany({
      where: {
        token_recuperacion: token
      },
      data: {
        token_recuperacion: null,
        token_expiracion: null,
        fecha_modificacion: new Date()
      }
    });
  }

  /**
   * Obtiene el email del usuario desde un token válido
   * @param token - Token a verificar
   * @returns El email del usuario si el token es válido, null en caso contrario
   */
  static async getUserEmailFromToken(token: string) {
    const tokenRecord = await this.verifyToken(token);
    return tokenRecord?.user?.email || null;
  }

  /**
   * Limpia tokens antiguos que han expirado
   */
  static async cleanupTokens() {
    const now = new Date();
    
    return await prisma.users.updateMany({
      where: {
        token_expiracion: {
          lt: now
        }
      },
      data: {
        token_recuperacion: null,
        token_expiracion: null,
        fecha_modificacion: new Date()
      }
    });
  }
}