import { prisma } from '../../../../config/database/db';

/**
 * Repositorio para gestionar tokens de recuperación de contraseña
 */
export class PasswordResetRepository {
  /**
   * Guarda un token de recuperación de contraseña
   * Si el usuario ya tiene un token, lo elimina y crea uno nuevo
   * @param userId - ID del usuario
   * @param token - Token generado
   * @returns El token creado
   */
  static async saveToken(userId: bigint, token: string) {
    // Primero intentamos eliminar cualquier token existente del usuario
    await prisma.password_reset_tokens.deleteMany({
      where: {
        user_id: userId
      }
    });

    // Luego creamos el nuevo token
    return await prisma.password_reset_tokens.create({
      data: {
        user_id: userId,
        token,
        created_at: new Date()
      }
    });
  }

  /**
   * Verifica si un token es válido y no ha sido usado
   * @param token - Token a verificar
   * @returns El registro del token con información del usuario si es válido, null en caso contrario
   */
  static async verifyToken(token: string) {
    // Obtener el registro con el token especificado incluyendo información del usuario
    const tokenRecord = await prisma.password_reset_tokens.findFirst({
      where: {
        token
      },
      include: {
        user: true
      }
    });

    // Verificar si el token existe
    if (!tokenRecord) {
      return null;
    }

    // Verificar si el token ha expirado (24 horas)
    const createdAt = new Date(tokenRecord.created_at || Date.now());
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - createdAt.getTime()) / 36e5; // Convertir ms a horas
    
    if (diffHours > 24) {
      // El token ha expirado, lo eliminamos
      await this.deleteToken(token);
      return null;
    }

    return tokenRecord;
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
   * Elimina un token específico
   * @param token - Token a eliminar
   * @returns Resultado de la eliminación
   */
  static async deleteToken(token: string) {
    // Eliminamos directamente usando el token como criterio único
    return await prisma.password_reset_tokens.delete({
      where: {
        token: token
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
   * Limpia tokens antiguos (mayores a 24 horas)
   */
  static async cleanupTokens() {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    return await prisma.password_reset_tokens.deleteMany({
      where: {
        created_at: {
          lt: oneDayAgo
        }
      }
    });
  }
} 