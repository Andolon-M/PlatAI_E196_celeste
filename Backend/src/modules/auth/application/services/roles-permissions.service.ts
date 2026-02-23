import { RolesPermissionsRepository } from '../../infrastructure/repositories/roles-permissions.repository';

/**
 * Interfaz para crear un rol
 */
export interface CreateRoleData {
  name: string;
  guard_name?: string;
}

/**
 * Interfaz para crear un permiso
 */
export interface CreatePermissionData {
  name: string;
  guard_name?: string;
}

/**
 * Interfaz para actualizar un rol
 */
export interface UpdateRoleData {
  name: string;
  guard_name?: string;
}

/**
 * Interfaz para actualizar un permiso
 */
export interface UpdatePermissionData {
  name: string;
  guard_name?: string;
}

/**
 * Interfaz para asignar permisos a un rol
 */
export interface AssignPermissionsData {
  permission_ids: bigint[];
}

/**
 * Servicio para gestionar roles y permisos
 */
export class RolesPermissionsService {

  // ========== ROLES ==========

  /**
   * Crea un nuevo rol
   * @param data - Datos del rol a crear
   * @returns Rol creado
   */
  static async createRole(data: CreateRoleData) {
    const { name } = data;

    // Validar que el nombre no esté vacío
    if (!name || name.trim().length === 0) {
      throw new Error('El nombre del rol es requerido');
    }

    // Validar que el nombre no exista
    const nameExists = await RolesPermissionsRepository.roleNameExists(name.trim());
    if (nameExists) {
      throw new Error(`Ya existe un rol con el nombre '${name}'`);
    }

    return await RolesPermissionsRepository.createRole(name.trim());
  }

  /**
   * Obtiene todos los roles con sus permisos
   * @returns Lista de roles con permisos
   */
  static async getAllRolesWithPermissions() {
    return await RolesPermissionsRepository.getAllRolesWithPermissions();
  }

  /**
   * Obtiene un rol por ID con sus permisos
   * @param roleId - ID del rol
   * @returns Rol con permisos
   */
  static async getRoleByIdWithPermissions(roleId: bigint) {
    const role = await RolesPermissionsRepository.getRoleByIdWithPermissions(roleId);
    
    if (!role) {
      throw new Error('Rol no encontrado');
    }

    return role;
  }

  /**
   * Actualiza un rol
   * @param roleId - ID del rol
   * @param data - Nuevos datos del rol
   * @returns Rol actualizado
   */
  static async updateRole(roleId: bigint, data: UpdateRoleData) {
    const { name } = data;

    // Validar que el rol existe
    const roleExists = await RolesPermissionsRepository.roleExists(roleId);
    if (!roleExists) {
      throw new Error('Rol no encontrado');
    }

    // Validar que el nombre no esté vacío
    if (!name || name.trim().length === 0) {
      throw new Error('El nombre del rol es requerido');
    }

    // Validar que el nombre no exista en otro rol
    const nameExists = await RolesPermissionsRepository.roleNameExists(name.trim(), roleId);
    if (nameExists) {
      throw new Error(`Ya existe un rol con el nombre '${name}'`);
    }

    return await RolesPermissionsRepository.updateRole(roleId, name.trim());
  }

  /**
   * Elimina un rol
   * @param roleId - ID del rol
   * @returns Resultado de la eliminación
   */
  static async deleteRole(roleId: bigint) {
    // Validar que el rol existe
    const roleExists = await RolesPermissionsRepository.roleExists(roleId);
    if (!roleExists) {
      throw new Error('Rol no encontrado');
    }

    return await RolesPermissionsRepository.deleteRole(roleId);
  }

  // ========== PERMISOS ==========

  /**
   * Crea un nuevo permiso
   * @param data - Datos del permiso a crear
   * @returns Permiso creado
   */
  static async createPermission(data: CreatePermissionData) {
    const { name } = data;

    // Validar que el nombre no esté vacío
    if (!name || name.trim().length === 0) {
      throw new Error('El nombre del permiso es requerido');
    }

    // Parsear el nombre del permiso (formato esperado: "resource:action" o solo "resource")
    const parts = name.trim().split(':');
    const resource = parts[0];
    const action = parts.length > 1 ? parts[1] : 'access';
    const type = 0; // Tipo por defecto

    // Validar que el nombre no exista
    const nameExists = await RolesPermissionsRepository.permissionNameExists(resource, action, type);
    if (nameExists) {
      throw new Error(`Ya existe un permiso con el nombre '${name}'`);
    }

    return await RolesPermissionsRepository.createPermission(resource, action, type);
  }

  /**
   * Obtiene todos los permisos
   * @returns Lista de permisos
   */
  static async getAllPermissions() {
    return await RolesPermissionsRepository.getAllPermissions();
  }

  /**
   * Obtiene un permiso por ID
   * @param permissionId - ID del permiso
   * @returns Permiso encontrado
   */
  static async getPermissionById(permissionId: bigint) {
    const permission = await RolesPermissionsRepository.getPermissionById(permissionId);
    
    if (!permission) {
      throw new Error('Permiso no encontrado');
    }

    return permission;
  }

  /**
   * Actualiza un permiso
   * @param permissionId - ID del permiso
   * @param data - Nuevos datos del permiso
   * @returns Permiso actualizado
   */
  static async updatePermission(permissionId: bigint, data: UpdatePermissionData) {
    const { name } = data;

    // Validar que el permiso existe
    const permissionExists = await RolesPermissionsRepository.permissionExists(permissionId);
    if (!permissionExists) {
      throw new Error('Permiso no encontrado');
    }

    // Validar que el nombre no esté vacío
    if (!name || name.trim().length === 0) {
      throw new Error('El nombre del permiso es requerido');
    }

    // Parsear el nombre del permiso (formato esperado: "resource:action" o solo "resource")
    const parts = name.trim().split(':');
    const resource = parts[0];
    const action = parts.length > 1 ? parts[1] : 'access';
    const type = 0; // Tipo por defecto

    // Validar que el nombre no exista en otro permiso
    const nameExists = await RolesPermissionsRepository.permissionNameExists(resource, action, type, permissionId);
    if (nameExists) {
      throw new Error(`Ya existe un permiso con el nombre '${name}'`);
    }

    return await RolesPermissionsRepository.updatePermission(permissionId, resource, action, type);
  }

  /**
   * Elimina un permiso
   * @param permissionId - ID del permiso
   * @returns Resultado de la eliminación
   */
  static async deletePermission(permissionId: bigint) {
    // Validar que el permiso existe
    const permissionExists = await RolesPermissionsRepository.permissionExists(permissionId);
    if (!permissionExists) {
      throw new Error('Permiso no encontrado');
    }

    return await RolesPermissionsRepository.deletePermission(permissionId);
  }

  // ========== ASIGNACIÓN DE PERMISOS A ROLES ==========

  /**
   * Asigna permisos a un rol
   * @param roleId - ID del rol
   * @param data - Datos con los IDs de permisos
   * @returns Resultado de la asignación
   */
  static async assignPermissionsToRole(roleId: bigint, data: AssignPermissionsData) {
    const { permission_ids } = data;

    // Validar que el rol existe
    const roleExists = await RolesPermissionsRepository.roleExists(roleId);
    if (!roleExists) {
      throw new Error('Rol no encontrado');
    }

    // Validar que todos los permisos existen
    for (const permissionId of permission_ids) {
      const permissionExists = await RolesPermissionsRepository.permissionExists(permissionId);
      if (!permissionExists) {
        throw new Error(`Permiso con ID ${permissionId} no encontrado`);
      }
    }

    return await RolesPermissionsRepository.assignPermissionsToRole(roleId, permission_ids);
  }

  /**
   * Obtiene los permisos de un rol
   * @param roleId - ID del rol
   * @returns Lista de permisos del rol
   */
  static async getRolePermissions(roleId: bigint) {
    // Validar que el rol existe
    const roleExists = await RolesPermissionsRepository.roleExists(roleId);
    if (!roleExists) {
      throw new Error('Rol no encontrado');
    }

    return await RolesPermissionsRepository.getRolePermissions(roleId);
  }

  /**
   * Elimina un permiso específico de un rol
   * @param roleId - ID del rol
   * @param permissionId - ID del permiso
   * @returns Resultado de la eliminación
   */
  static async removePermissionFromRole(roleId: bigint, permissionId: bigint) {
    // Validar que el rol existe
    const roleExists = await RolesPermissionsRepository.roleExists(roleId);
    if (!roleExists) {
      throw new Error('Rol no encontrado');
    }

    // Validar que el permiso existe
    const permissionExists = await RolesPermissionsRepository.permissionExists(permissionId);
    if (!permissionExists) {
      throw new Error('Permiso no encontrado');
    }

    // Validar que el rol tiene el permiso
    const hasPermission = await RolesPermissionsRepository.roleHasPermission(roleId, permissionId);
    if (!hasPermission) {
      throw new Error('El rol no tiene asignado este permiso');
    }

    return await RolesPermissionsRepository.removePermissionFromRole(roleId, permissionId);
  }

  // ========== MÉTODOS DE UTILIDAD ==========

  /**
   * Valida que un array de IDs de permisos sea válido
   * @param permissionIds - Array de IDs de permisos
   * @returns Array de IDs válidos
   */
  static async validatePermissionIds(permissionIds: bigint[]) {
    const validIds: bigint[] = [];
    
    for (const id of permissionIds) {
      const exists = await RolesPermissionsRepository.permissionExists(id);
      if (exists) {
        validIds.push(id);
      }
    }

    return validIds;
  }

  /**
   * Obtiene estadísticas de roles y permisos
   * @returns Estadísticas del sistema
   */
  static async getStats() {
    const [rolesCount, permissionsCount] = await Promise.all([
      RolesPermissionsRepository.getAllRolesWithPermissions(),
      RolesPermissionsRepository.getAllPermissions()
    ]);

    return {
      total_roles: rolesCount.length,
      total_permissions: permissionsCount.length,
      roles_with_permissions: rolesCount.filter(role => role.permissions.length > 0).length
    };
  }
}
