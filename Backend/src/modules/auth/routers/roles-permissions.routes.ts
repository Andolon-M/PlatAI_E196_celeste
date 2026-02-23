import { Router } from 'express';
import { RolesPermissionsController } from '../application/controllers/roles-permissions.controller';
import { 
  validateCreateRole,
  validateUpdateRole,
  validateCreatePermission,
  validateUpdatePermission,
  validateAssignPermissions,
  validateIdParam,
  validateRolePermissionParams,
  sanitizeInput
} from '../application/validators/roles-permissions.validator';

const router = Router();

// ========== RUTAS DE ROLES ==========

/**
 * @route POST /api/auth/roles
 * @desc Crear un nuevo rol
 * @access Private (requiere autenticación)
 */
router.post('/roles', 
  sanitizeInput,
  validateCreateRole,
  RolesPermissionsController.createRole
);

/**
 * @route GET /api/auth/roles
 * @desc Obtener todos los roles con sus permisos
 * @access Private (requiere autenticación)
 */
router.get('/roles', 
  RolesPermissionsController.getAllRolesWithPermissions
);

/**
 * @route GET /api/auth/roles/:id
 * @desc Obtener un rol por ID con sus permisos
 * @access Private (requiere autenticación)
 */
router.get('/roles/:id', 
  validateIdParam,
  RolesPermissionsController.getRoleByIdWithPermissions
);

/**
 * @route PUT /api/auth/roles/:id
 * @desc Actualizar un rol
 * @access Private (requiere autenticación)
 */
router.put('/roles/:id', 
  sanitizeInput,
  validateUpdateRole,
  RolesPermissionsController.updateRole
);

/**
 * @route DELETE /api/auth/roles/:id
 * @desc Eliminar un rol
 * @access Private (requiere autenticación)
 */
router.delete('/roles/:id', 
  validateIdParam,
  RolesPermissionsController.deleteRole
);

// ========== RUTAS DE PERMISOS ==========

/**
 * @route POST /api/auth/permissions
 * @desc Crear un nuevo permiso
 * @access Private (requiere autenticación)
 */
router.post('/permissions', 
  sanitizeInput,
  validateCreatePermission,
  RolesPermissionsController.createPermission
);

/**
 * @route GET /api/auth/permissions
 * @desc Obtener todos los permisos
 * @access Private (requiere autenticación)
 */
router.get('/permissions', 
  RolesPermissionsController.getAllPermissions
);

/**
 * @route GET /api/auth/permissions/:id
 * @desc Obtener un permiso por ID
 * @access Private (requiere autenticación)
 */
router.get('/permissions/:id', 
  validateIdParam,
  RolesPermissionsController.getPermissionById
);

/**
 * @route PUT /api/auth/permissions/:id
 * @desc Actualizar un permiso
 * @access Private (requiere autenticación)
 */
router.put('/permissions/:id', 
  sanitizeInput,
  validateUpdatePermission,
  RolesPermissionsController.updatePermission
);

/**
 * @route DELETE /api/auth/permissions/:id
 * @desc Eliminar un permiso
 * @access Private (requiere autenticación)
 */
router.delete('/permissions/:id', 
  validateIdParam,
  RolesPermissionsController.deletePermission
);

// ========== RUTAS DE ASIGNACIÓN DE PERMISOS A ROLES ==========

/**
 * @route POST /api/auth/roles/:id/permissions
 * @desc Asignar permisos a un rol
 * @access Private (requiere autenticación)
 */
router.post('/roles/:id/permissions', 
  validateAssignPermissions,
  RolesPermissionsController.assignPermissionsToRole
);

/**
 * @route GET /api/auth/roles/:id/permissions
 * @desc Obtener los permisos de un rol
 * @access Private (requiere autenticación)
 */
router.get('/roles/:id/permissions', 
  validateIdParam,
  RolesPermissionsController.getRolePermissions
);

/**
 * @route DELETE /api/auth/roles/:roleId/permissions/:permissionId
 * @desc Eliminar un permiso específico de un rol
 * @access Private (requiere autenticación)
 */
router.delete('/roles/:roleId/permissions/:permissionId', 
  validateRolePermissionParams,
  RolesPermissionsController.removePermissionFromRole
);

// ========== RUTAS DE UTILIDAD ==========

/**
 * @route GET /api/auth/roles-permissions/stats
 * @desc Obtener estadísticas del sistema de roles y permisos
 * @access Private (requiere autenticación)
 */
router.get('/roles-permissions/stats', 
  RolesPermissionsController.getStats
);

export default router;
