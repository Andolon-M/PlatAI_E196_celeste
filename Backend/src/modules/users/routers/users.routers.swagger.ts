/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único del usuario
 *           example: "1"
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *           example: "usuario@example.com"
 *         email_verified_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de verificación del email
 *           example: "2024-01-01T00:00:00.000Z"
 *         google_id:
 *           type: string
 *           description: ID de Google del usuario
 *           example: "1234567890"
 *         image:
 *           type: string
 *           description: URL de la imagen de perfil
 *           example: "https://example.com/image.jpg"
 *         role_id:
 *           type: string
 *           description: ID del rol del usuario
 *           example: "1"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *         role_name:
 *           type: string
 *           description: Nombre del rol
 *           example: "admin"
 *         member_id:
 *           type: string
 *           description: ID del miembro asociado
 *           example: "1"
 *         member_name:
 *           type: string
 *           description: Nombre del miembro asociado
 *           example: "Juan"
 *         member_last_name:
 *           type: string
 *           description: Apellido del miembro asociado
 *           example: "Pérez"
 *         member_dni:
 *           type: string
 *           description: DNI del miembro asociado
 *           example: "12345678"
 *         member_status:
 *           type: string
 *           enum: [ASISTENTE, ACTIVO, INACTIVO]
 *           description: Estado del miembro asociado
 *           example: "ACTIVO"
 *         work_teams_count:
 *           type: integer
 *           description: Número de equipos de trabajo creados
 *           example: 2
 *         team_memberships_count:
 *           type: integer
 *           description: Número de equipos a los que pertenece
 *           example: 3
 *     
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           description: Email del usuario (requerido)
 *           example: "usuario@example.com"
 *         password:
 *           type: string
 *           minLength: 6
 *           maxLength: 255
 *           description: Contraseña del usuario
 *           example: "password123"
 *         google_id:
 *           type: string
 *           maxLength: 255
 *           description: ID de Google del usuario
 *           example: "1234567890"
 *         image:
 *           type: string
 *           maxLength: 255
 *           description: URL de la imagen de perfil
 *           example: "https://example.com/image.jpg"
 *         role_id:
 *           type: string
 *           pattern: '^[0-9]+$'
 *           description: ID del rol del usuario
 *           example: "1"
 *         email_verified_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de verificación del email
 *           example: "2024-01-01T00:00:00.000Z"
 *     
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 255
 *           description: Email del usuario
 *           example: "usuario@example.com"
 *         password:
 *           type: string
 *           minLength: 6
 *           maxLength: 255
 *           description: Contraseña del usuario
 *           example: "newpassword123"
 *         google_id:
 *           type: string
 *           maxLength: 255
 *           description: ID de Google del usuario
 *           example: "1234567890"
 *         image:
 *           type: string
 *           maxLength: 255
 *           description: URL de la imagen de perfil
 *           example: "https://example.com/image.jpg"
 *         role_id:
 *           type: string
 *           pattern: '^[0-9]+$'
 *           description: ID del rol del usuario
 *           example: "2"
 *         email_verified_at:
 *           type: string
 *           format: date-time
 *           description: Fecha de verificación del email
 *           example: "2024-01-01T00:00:00.000Z"
 *     
 *     UserStats:
 *       type: object
 *       properties:
 *         total_users:
 *           type: integer
 *           description: Total de usuarios
 *           example: 100
 *         verified_users:
 *           type: integer
 *           description: Usuarios con email verificado
 *           example: 80
 *         unverified_users:
 *           type: integer
 *           description: Usuarios sin email verificado
 *           example: 20
 *         google_users:
 *           type: integer
 *           description: Usuarios con cuenta de Google
 *           example: 30
 *         password_users:
 *           type: integer
 *           description: Usuarios con contraseña
 *           example: 70
 *         total_roles:
 *           type: integer
 *           description: Total de roles distintos
 *           example: 5
 *     
 *     UserDetailedStats:
 *       type: object
 *       properties:
 *         work_teams_created:
 *           type: integer
 *           description: Equipos de trabajo creados
 *           example: 2
 *         team_memberships:
 *           type: integer
 *           description: Equipos a los que pertenece
 *           example: 3
 * 
 * /users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     description: Crea un nuevo usuario en el sistema con email único
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "Usuario creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error de validación o email ya existe
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos para crear usuarios
 *       500:
 *         description: Error interno del servidor
 *   
 *   get:
 *     summary: Obtener todos los usuarios con filtros
 *     description: Obtiene una lista paginada de usuarios con múltiples opciones de filtrado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Filtrar por ID específico del usuario
 *         example: "1"
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         description: Filtrar por email específico del usuario
 *         example: "usuario@example.com"
 *       - in: query
 *         name: role_id
 *         schema:
 *           type: string
 *         description: Filtrar por ID de rol
 *         example: "1"
 *       - in: query
 *         name: has_profile
 *         schema:
 *           type: boolean
 *         description: Filtrar por usuarios con/sin perfil asociado
 *         example: true
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por email o nombre/apellido
 *         example: "Juan"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Tamaño de página
 *         example: 20
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Usuarios obtenidos exitosamente"
 *                 data:
 *                   oneOf:
 *                     - type: object
 *                       description: Usuario específico cuando se usa id o email
 *                       $ref: '#/components/schemas/User'
 *                     - type: object
 *                       description: Lista paginada de usuarios
 *                       properties:
 *                         rows:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/User'
 *                         count:
 *                           type: integer
 *                           description: Total de usuarios que coinciden con los filtros
 *                           example: 100
 *                         totalPages:
 *                           type: integer
 *                           description: Total de páginas
 *                           example: 5
 *                         currentPage:
 *                           type: integer
 *                           description: Página actual
 *                           example: 1
 *       400:
 *         description: Error en los parámetros de búsqueda
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos para leer usuarios
 *       404:
 *         description: Usuario no encontrado (cuando se busca por ID o email)
 *       500:
 *         description: Error interno del servidor
 * 
 * /users/stats:
 *   get:
 *     summary: Obtener estadísticas de usuarios
 *     description: Obtiene estadísticas generales del sistema o estadísticas específicas de un usuario por ID o email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: ID del usuario para estadísticas específicas (opcional)
 *         example: "1"
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         description: Email del usuario para estadísticas específicas (opcional)
 *         example: "usuario@example.com"
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Estadísticas obtenidas exitosamente"
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/UserStats'
 *                       description: Estadísticas generales (sin parámetros)
 *                     - $ref: '#/components/schemas/UserDetailedStats'
 *                       description: Estadísticas específicas (con id o email)
 *       400:
 *         description: Parámetros inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos para ver estadísticas
 *       404:
 *         description: Usuario no encontrado (cuando se busca por id o email)
 *       500:
 *         description: Error interno del servidor
 * 
 * /users/{id}:
 *   put:
 *     summary: Actualizar usuario
 *     description: Actualiza los datos de un usuario existente
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *         example: "1"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Usuario actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error de validación o email ya existe
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos para actualizar usuarios
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 *   
 *   delete:
 *     summary: Eliminar usuario
 *     description: Elimina un usuario del sistema (soft delete)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *         example: "1"
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado exitosamente"
 *                 data:
 *                   type: null
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Sin permisos para eliminar usuarios
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */

export {};
