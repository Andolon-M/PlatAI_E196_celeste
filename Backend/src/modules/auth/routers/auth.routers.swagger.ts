// Importar la documentación de roles y permisos
import './roles-permissions.routers.swagger';

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario
 *           example: andolon.m@gmail.com
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario
 *           example: "andolon1"
 *       
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         # Campos de usuario (users)
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario
 *           example: usuario@ejemplo.com
 *         password:
 *           type: string
 *           format: password
 *           description: Contraseña del usuario
 *           example: "Contraseña123"
 *         google_id:
 *           type: string
 *           description: ID de Google (opcional)
 *           example: "118234567890"
 *         image:
 *           type: string
 *           description: URL de la imagen de perfil (opcional)
 *           example: "https://ejemplo.com/imagen.jpg"
 *           nullable: true
 *
 *         # Campos de perfil (user_profiles)
 *         name:
 *           type: string
 *           description: Nombre
 *           example: "Juan"
 *         last_name:
 *           type: string
 *           description: Apellido
 *           example: "Pérez"
 *         phone:
 *           type: string
 *           description: Teléfono
 *           example: "3001234567"
 *         autoGeneratePassword:
 *           type: boolean
 *           description: Generar contraseña automáticamente
 *
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: bigint
 *           description: ID único del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario
 *         email_verified_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de verificación del correo electrónico
 *           nullable: true
 *         google_id:
 *           type: string
 *           description: ID de Google
 *           nullable: true
 *         image:
 *           type: string
 *           description: URL de la imagen de perfil
 *           nullable: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *           nullable: true
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *           nullable: true
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de eliminación
 *           nullable: true
 *         registerComplete:
 *           type: boolean
 *           description: Indica si el registro ha sido completado
 *           nullable: true
 *         user_profiles:
 *           $ref: '#/components/schemas/UserProfile'
 *           description: Perfil del usuario (nombre, apellido, teléfono)
 *
 *     UserProfile:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: bigint
 *           description: ID del perfil
 *         user_id:
 *           type: string
 *           format: bigint
 *           description: ID del usuario
 *         name:
 *           type: string
 *           description: Nombre
 *         last_name:
 *           type: string
 *           description: Apellido
 *         phone:
 *           type: string
 *           description: Teléfono
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           example: 200
 *         message:
 *           type: string
 *           example: "Operación exitosa"
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: Token JWT de autenticación
 *             user:
 *               $ref: '#/components/schemas/User'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           example: 400
 *         message:
 *           type: string
 *           example: "Error en la operación"
 *         data:
 *           type: object
 *           properties:
 *             errors:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   msg:
 *                     type: string
 *                   param:
 *                     type: string
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * paths:
 *   /auth/login:
 *     post:
 *       tags:
 *         - Autenticación
 *       summary: Iniciar sesión de usuario
 *       description: Autentica un usuario mediante correo y contraseña y devuelve un token JWT
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginRequest'
 *       responses:
 *         200:
 *           description: Login exitoso
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/AuthResponse'
 *         400:
 *           description: Error de validación
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         401:
 *           description: Credenciales inválidas
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *
 *   /auth/register:
 *     post:
 *       tags:
 *         - Autenticación
 *       summary: Registrar nuevo usuario
 *       description: Crea un nuevo usuario en el sistema con correo y contraseña, opcionalmente con datos adicionales como miembro
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterRequest'
 *       responses:
 *         201:
 *           description: Usuario creado exitosamente
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/AuthResponse'
 *         400:
 *           description: Error de validación
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *
 *   /auth/me:
 *     get:
 *       tags:
 *         - Autenticación
 *       summary: Obtener información del usuario actual
 *       description: Devuelve la información del usuario autenticado
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Información del usuario
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: integer
 *                     example: 200
 *                   message:
 *                     type: string
 *                     example: "Información del usuario obtenida correctamente"
 *                   data:
 *                     $ref: '#/components/schemas/User'
 *         401:
 *           description: No autenticado
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *
 *   /auth/logout:
 *     post:
 *       tags:
 *         - Autenticación
 *       summary: Cerrar sesión
 *       description: Cierra la sesión actual del usuario
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Sesión cerrada exitosamente
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: integer
 *                     example: 200
 *                   message:
 *                     type: string
 *                     example: "Sesión cerrada exitosamente"
 *                   data:
 *                     type: object
 *                     nullable: true
 *         500:
 *           description: Error al cerrar sesión
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *
 *   /auth/request-reset:
 *     post:
 *       tags:
 *         - Autenticación
 *       summary: Solicitar restablecimiento de contraseña
 *       description: Envía un correo con enlace para restablecer contraseña
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 email:
 *                   type: string
 *                   format: email
 *       responses:
 *         200:
 *           description: Correo enviado exitosamente
 *         400:
 *           description: Error en la solicitud
 *
 *   /auth/reset-password:
 *     post:
 *       tags:
 *         - Autenticación
 *       summary: Restablecer contraseña
 *       description: Restablece la contraseña utilizando un token de recuperación
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - token
 *                 - newPassword
 *               properties:
 *                 token:
 *                   type: string
 *                 newPassword:
 *                   type: string
 *       responses:
 *         200:
 *           description: Contraseña actualizada correctamente
 *         400:
 *           description: Error al restablecer contraseña
 */

export {};
