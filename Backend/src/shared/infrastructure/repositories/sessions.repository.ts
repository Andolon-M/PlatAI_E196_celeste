import { prisma } from '../../../config/database/db';

/**
 * Repositorio para gestionar el ciclo de vida de las sesiones activas en la base de datos
 */
export class SessionsRepository {
  /**
   * Crea una nueva sesión activa en la base de datos
   * @param userId - ID del usuario
   * @param token - Token JWT generado
   * @param ip - Dirección IP del cliente
   * @param device - Información del dispositivo (User Agent)
   * @returns El registro de sesión creado
   */
  static async createSession(userId: bigint, token: string, ip?: string, device?: string) {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24); // La sesión expira en 24 horas por defecto

    return await prisma.sesiones.create({
      data: {
        id_usuario: userId,
        token,
        ip: ip || 'unknown',
        dispositivo: device || 'unknown',
        fecha_expiracion: expiry,
        activa: 1,
        fecha_creacion: new Date()
      }
    });
  }

  /**
   * Verifica si existe una sesión activa y válida para un usuario y token
   * @param userId - ID del usuario
   * @param token - Token JWT a verificar
   * @returns true si la sesión está activa y no ha expirado, false de lo contrario
   */
  static async checkSessionActive(userId: bigint, token: string): Promise<boolean> {
    const now = new Date();
    
    const session = await prisma.sesiones.findFirst({
      where: {
        id_usuario: userId,
        token,
        activa: 1,
        fecha_expiracion: {
          gt: now
        }
      }
    });

    return !!session;
  }

  /**
   * Inactiva una sesión específica mediante su token (revocación por Logout)
   * @param token - Token de sesión a invalidar
   * @returns El número de registros actualizados
   */
  static async revokeSession(token: string) {
    return await prisma.sesiones.updateMany({
      where: {
        token
      },
      data: {
        activa: 0
      }
    });
  }

  /**
   * Inactiva todas las sesiones de un usuario (para cierres de sesión forzados)
   * @param userId - ID del usuario
   * @returns El número de registros actualizados
   */
  static async revokeAllUserSessions(userId: bigint) {
    return await prisma.sesiones.updateMany({
      where: {
        id_usuario: userId,
        activa: 1
      },
      data: {
        activa: 0
      }
    });
  }
}
