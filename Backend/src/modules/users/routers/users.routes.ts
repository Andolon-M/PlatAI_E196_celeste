import { Router } from 'express';
import { UsersController } from '../application/controllers/users.controller';
import { UsersValidator } from '../application/validators/users.validator';
import { isAuthenticated, isAuthorized } from '../../../shared/infrastructure/middlewares/auth.middleware';
import { validateRequest } from '../../../shared/application/validators/validation.middleware';

const router = Router();

// ========== RUTAS DE USUARIOS ==========

/**
 * @route POST /users
 * @desc Crear un nuevo usuario
 * @access Private (requiere autenticación y permisos)
 */
router.post(
  '/',
  isAuthenticated,
  isAuthorized('users', 'create'),
  UsersValidator.createUser(),
  validateRequest,
  UsersController.createUser
);

/**
 * @route GET /users/stats
 * @desc Obtener estadísticas de usuarios (generales o específicas)
 * @access Private (requiere autenticación y permisos)
 * @query {string} id - ID del usuario para estadísticas específicas (opcional)
 * @query {string} email - Email del usuario para estadísticas específicas (opcional)
 */
router.get(
  '/stats',
  isAuthenticated,
  isAuthorized('users', 'read'),
  UsersValidator.getUserStatsFilters(),
  validateRequest,
  UsersController.getUserStats
);

/**
 * @route GET /users
 * @desc Obtener todos los usuarios con paginación y filtros
 * @access Private (requiere autenticación y permisos)
 * @query {string} id - ID del usuario (opcional)
 * @query {string} email - Email del usuario (opcional)
 * @query {string} role_id - ID del rol (opcional)
 * @query {boolean} has_profile - Filtrar por usuarios con/sin perfil asociado (opcional)
 * @query {string} search - Buscar por email o nombre/apellido (opcional)
 * @query {number} page - Número de página (opcional, default: 1)
 * @query {number} pageSize - Tamaño de página (opcional, default: 20)
 */
router.get(
  '/',
  isAuthenticated,
  isAuthorized('users', 'read'),
  UsersValidator.getUsersFilters(),
  validateRequest,
  UsersController.getAllUsers
);

/**
 * @route PUT /users/:id
 * @desc Actualizar un usuario
 * @access Private (requiere autenticación y permisos)
 */
router.put(
  '/:id',
  isAuthenticated,
  isAuthorized('users', 'update'),
  UsersValidator.updateUser(),
  validateRequest,
  UsersController.updateUser
);

/**
 * @route DELETE /users/:id
 * @desc Eliminar un usuario
 * @access Private (requiere autenticación y permisos)
 */
router.delete(
  '/:id',
  isAuthenticated,
  isAuthorized('users', 'delete'),
  UsersValidator.deleteUser(),
  validateRequest,
  UsersController.deleteUser
);

export default router;

