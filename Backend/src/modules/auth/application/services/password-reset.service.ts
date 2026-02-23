import { prisma } from '../../../../config/database/db';
import { generateRecoveryToken, verifyRecoveryToken } from '../security/auth.security';
import { hashPassword } from '../security/auth.security';
import { AuthRepository } from '../../infrastructure/repositories/auth.repository';
import { PasswordResetRepository } from '../../infrastructure/repositories/password-reset.repository';
import { sendTemplatedEmail } from '../../../../shared/infrastructure/mailers';

/**
 * Servicio para gestionar el proceso de restablecimiento de contraseña
 */
export class PasswordResetService {
  /**
   * Envía un enlace de restablecimiento de contraseña al correo especificado
   * @param email - Correo electrónico del usuario
   * @throws Error si el correo no está registrado
   */
  static async sendResetLink(email: string) {
    //consultamos el usuario por el email usando el repositorio de usuarios
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) throw new Error('Correo no registrado');
    if (!user.id) throw new Error('ID de usuario inválido');

    // Generamos el token de recuperación con el email
    const token = generateRecoveryToken(email);
    
    // Guardamos el token en la base de datos
    await PasswordResetRepository.saveToken(user.id, token);

    // Limpiamos tokens antiguos
    await PasswordResetRepository.cleanupTokens();

    // Armamos el link aquí y enviamos SOLO asunto + texto (la plantilla vive en shared)
    const production = process.env.EXPRESS_PRODUCTION?.toLowerCase() === 'true';
    const url = production
      ? `https://${process.env.BASE_URL}`
      : `http://${process.env.BASE_URL_LOCAL}:${Number(process.env.EXPRESS_PORT ?? '3000') + 1}`;

    const link = `${url}/reset-password/${token}`;

    await sendTemplatedEmail({
      to: email,
      subject: 'Restablecer contraseña - Finanzas App',
      recipientName: email.split('@')[0],
      contentText: [
        'Hemos recibido una solicitud para restablecer tu contraseña.',
        '',

        'Para continuar, haz click en el siguiente botón:',
        '{{ACTION_BUTTON}}',
        '',
        'O bien, copia y pega el siguiente enlace en tu navegador:',
        link,
        '',
        '',
        'Si no solicitaste este cambio, puedes ignorar este correo.',
      ].join('\n'),
      action: {
        title: 'Restablecer contraseña',
        url: link,
      },
    });
  }

  /**
   * Verifica si un token de recuperación es válido
   * @param token - Token a verificar
   * @returns true si el token es válido, false en caso contrario
   */
  static async verifyResetToken(token: string) {
    try {
      // Verificamos que el token sea válido en formato JWT
      const decoded = verifyRecoveryToken(token);
      
      // Verificamos que el token no haya sido usado
      const tokenRecord = await PasswordResetRepository.verifyToken(token);
      if (!tokenRecord) {
        return { valid: false, message: 'Token inválido o ya utilizado' };
      }
      
      // Verificamos que el usuario exista
      const user = await AuthRepository.findUserByEmail(tokenRecord.user.email);
      if (!user) {
        return { valid: false, message: 'Usuario no encontrado' };
      }
      
      return { valid: true, email: tokenRecord.user.email };
    } catch (error) {
      return { valid: false, message: (error as Error).message || 'Token inválido' };
    }
  }

  /**
   * Restablece la contraseña de un usuario utilizando un token de recuperación
   * @param token - Token de recuperación
   * @param newPassword - Nueva contraseña
   * @returns true si la contraseña se restableció correctamente
   * @throws Error si ocurre algún problema durante el proceso
   */
  static async resetPassword(token: string, newPassword: string) {
    // Verificamos que el token sea válido
    const verification = await this.verifyResetToken(token);
    if (!verification.valid) {
      throw new Error(verification.message || 'Token inválido');
    }
    
    const email = verification.email;
    if (!email) {
      throw new Error('Email de usuario inválido');
    }
    
    // Buscamos el usuario por email
    const user = await AuthRepository.findUserByEmail(email);
    if (!user || !user.id) {
      throw new Error('Usuario no encontrado');
    }

    // Actualizamos la contraseña
    const hashedPassword = hashPassword(newPassword);
    await AuthRepository.updateUserPassword(BigInt(user.id.toString()), hashedPassword);
    
    // Marcamos el token como usado
    await PasswordResetRepository.markTokenAsUsed(token);
    
    return true;
  }
}