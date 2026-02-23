import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { PasswordResetService } from "../services/password-reset.service";
import { AuthRepository } from "../../infrastructure/repositories/auth.repository";
import type { PassportUser } from "../../../../shared/infrastructure/middlewares/passport.middleware";

/**
 * Controlador para manejar las operaciones de autenticación
 */
export class AuthController {
  /**
   * Maneja la solicitud de inicio de sesión
   * @param {Request} req - Objeto de solicitud de Express
   * @param {Response} res - Objeto de respuesta de Express
   * @returns {Promise<Response>} Respuesta con el token JWT o mensaje de error
   */
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const authResponse = await AuthService.login(email, password);
      
      return res.status(200).json({
        status: 200,
        message: "Inicio de sesión exitoso",
        data: {
          user: authResponse.user,
          token: authResponse.token
        }
      });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        message: "Error de autenticación: " + (error as Error).message,
        data: { error: (error as Error).message || 'Error de autenticación' }
      });
    }
  }

  /**
   * Maneja la solicitud de registro de usuario
   * @param {Request} req - Objeto de solicitud de Express
   * @param {Response} res - Objeto de respuesta de Express
   * @returns {Promise<Response>} Respuesta con mensaje de éxito o error
   */
  static async register(req: Request, res: Response) {
    try {
      // Extraer todos los campos posibles del cuerpo de la solicitud
      const {
        email,
        password,
        autoGeneratePassword,
        google_id,
        image,
        name,
        last_name,
        phone
      } = req.body;

      const registerData = {
        email,
        password,
        autoGeneratePassword: autoGeneratePassword === true,
        ...(google_id && { google_id }),
        ...(image && { image }),
        ...(name && { name }),
        ...(last_name && { last_name }),
        ...(phone && { phone })
      };

      const authResponse = await AuthService.register(registerData);

      // Preparar respuesta de éxito
      const responseData = { 
        user: authResponse.user,
        token: authResponse.token
      };

      // Incluir la contraseña generada si existe
      if (authResponse.generatedPassword) {
        Object.assign(responseData, { 
          generatedPassword: authResponse.generatedPassword,
          passwordMessage: "Se ha enviado un correo con la contraseña temporal al usuario"
        });
      }

      return res.status(201).json({
        status: 201,
        message: "Usuario registrado exitosamente",
        data: responseData
      });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        message: "Error al crear usuario",
        data: { error: (error as Error).message || 'Error al crear usuario' }
      });
    }
  }

  /**
   * Maneja el callback de autenticación de Google
   * @param {Request} req - Objeto de solicitud de Express
   * @param {Response} res - Objeto de respuesta de Express
   * @returns {Promise<Response>} Respuesta con el token JWT o redirección a una página de error
   */
  static async googleCallback(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 401,
          message: "Autenticación fallida",
          data: { error: "Usuario no autenticado" }
        });
      }

      const authResponse = await AuthService.googleLogin(req.user);

      // Persistir tokens OAuth (una sola cuenta Google por usuario)
      const passportUser = req.user as PassportUser;
      if (passportUser?.accessToken && authResponse.user?.id) {
        await AuthRepository.upsertUserOAuthTokens(BigInt(authResponse.user.id), 'google', {
          access_token: passportUser.accessToken,
          refresh_token: passportUser.refreshToken ?? null
        });
      }

      // Determinar el entorno y construir la URL de redirección
      const isProduction = process.env.EXPRESS_PRODUCTION?.toLowerCase() === 'true';
      const frontendUrl = isProduction ? `https://${process.env.BASE_URL}` : `http://${process.env.BASE_URL_LOCAL}:${Number(process.env.EXPRESS_PORT) + 1}` || 'http://localhost:3000';

      // Redirigir al frontend con el token
      return res.redirect(`${frontendUrl}/home?token=${authResponse.token}`);
    } catch (error) {
      console.error('Error en googleCallback:', error);
      return res.status(500).json({
        status: 500,
        message: "Error al procesar la autenticación",
        data: { error: "Error interno del servidor" }
      });
    }
  }

  /**
   * Maneja la solicitud de cierre de sesión [OBSOLETA]
   * @param {Request} req - Objeto de solicitud de Express
   * @param {Response} res - Objeto de respuesta de Express
   * @returns {Promise<Response>} Respuesta con mensaje de éxito
   */
  static async logout(req: Request, res: Response) {
    try {
      // Logica para manejo de cierre de sesión
      // Nota: Con tokens JWT, el cierre de sesión generalmente se maneja del lado del cliente

      return res.status(200).json({
        status: 200,
        message: "Sesión cerrada exitosamente",
        data: {}
      });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        message: "Error al cerrar sesión",
        data: { error: (error as Error).message || 'Error al cerrar sesión' }
      });
    }
  }

  static async requestPasswordReset(req: Request, res: Response) {
    try {
      await PasswordResetService.sendResetLink(req.body.email);
      return res.status(200).json({ message: 'Correo enviado con el enlace de recuperación' });
    } catch (error) {
      return res.status(400).json({ message: (error as Error).message });
    }
  }

  /**
   * Verifica si un token de recuperación de contraseña es válido
   * @param req - Solicitud HTTP con el token
   * @param res - Respuesta HTTP
   */
  static async verifyResetToken(req: Request, res: Response) {
    try {
      const { token } = req.params;
      const result = await PasswordResetService.verifyResetToken(token);

      if (result.valid) {
        return res.status(200).json({
          status: 200,
          valid: true,
          message: 'Token válido'
        });
      } else {
        return res.status(400).json({
          status: 400,
          valid: false,
          message: result.message || 'Token inválido'
        });
      }
    } catch (error) {
      return res.status(400).json({
        status: 400,
        valid: false,
        message: (error as Error).message
      });
    }
  }

  /**
   * Procesa el restablecimiento de contraseña
   * @param req - Solicitud HTTP con el token y la nueva contraseña
   * @param res - Respuesta HTTP
   */
  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          status: 400,
          message: 'Se requiere token y nueva contraseña'
        });
      }

      await PasswordResetService.resetPassword(token, newPassword);

      return res.status(200).json({
        status: 200,
        message: 'Contraseña actualizada correctamente'
      });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        message: (error as Error).message
      });
    }
  }
}

