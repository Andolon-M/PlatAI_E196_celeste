import { prisma } from '../../../../config/database/db';
import { Prisma } from '@prisma/client';

/**
 * Repositorio para gestionar roles y permisos
 */
export class RolesPermissionsRepository {
  
  // ========== ROLES ==========
  
  /**
   * Crea un nuevo rol
   * @param name - Nombre del rol
   * @param guardName - Nombre del guard (por defecto 'web')
   * @returns El rol creado
   */
  static async createRole(name: string) {
    return await prisma.roles.create({
      data: {
        name,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  /**
   * Obtiene todos los roles con sus permisos usando SQL nativo
   * @returns Lista de roles con sus permisos
   */
  static async getAllRolesWithPermissions() {
    const roles = await prisma.$queryRaw`
      SELECT 
        r.id,
        r.name,
        r.created_at,
        r.updated_at,
        GROUP_CONCAT(
          CONCAT(
            '{"id":', p.id, 
            ',"resource":"', p.resource, 
            '","action":"', p.action,
            '","type":', p.type, 
            ',"created_at":"', p.created_at, 
            '","updated_at":"', p.updated_at, '"}'
          ) SEPARATOR ','
        ) as permissions_json
      FROM roles r
      LEFT JOIN role_has_permissions rhp ON r.id = rhp.role_id
      LEFT JOIN permissions p ON rhp.permission_id = p.id AND p.deleted_at IS NULL
      WHERE r.deleted_at IS NULL
      GROUP BY r.id, r.name, r.created_at, r.updated_at
      ORDER BY r.name
    ` as any[];

    return roles.map(role => ({
      ...role,
      permissions: role.permissions_json 
        ? JSON.parse(`[${role.permissions_json}]`) 
        : []
    }));
  }

  /**
   * Obtiene un rol por ID con sus permisos usando SQL nativo
   * @param roleId - ID del rol
   * @returns Rol con sus permisos
   */
  static async getRoleByIdWithPermissions(roleId: bigint) {
    const result = await prisma.$queryRaw`
      SELECT 
        r.id,
        r.name,
        r.created_at,
        r.updated_at,
        GROUP_CONCAT(
          CONCAT(
            '{"id":', p.id, 
            ',"name":"', p.name, 
            '","guard_name":"', p.guard_name, 
            '","created_at":"', p.created_at, 
            '","updated_at":"', p.updated_at, '"}'
          ) SEPARATOR ','
        ) as permissions_json
      FROM roles r
      LEFT JOIN role_has_permissions rhp ON r.id = rhp.role_id
      LEFT JOIN permissions p ON rhp.permission_id = p.id
      WHERE r.id = ${roleId} AND r.deleted_at IS NULL
      GROUP BY r.id, r.name, r.created_at, r.updated_at
    ` as any[];

    if (result.length === 0) return null;

    const role = result[0];
    return {
      ...role,
      permissions: role.permissions_json 
        ? JSON.parse(`[${role.permissions_json}]`) 
        : []
    };
  }

  /**
   * Actualiza un rol
   * @param roleId - ID del rol
   * @param name - Nuevo nombre del rol
   * @param guardName - Nuevo guard name
   * @returns Rol actualizado
   */
  static async updateRole(roleId: bigint, name: string) {
    return await prisma.roles.update({
      where: { id: roleId },
      data: {
        name,
        updated_at: new Date()
      }
    });
  }

  /**
   * Elimina un rol (soft delete)
   * @param roleId - ID del rol
   * @returns Resultado de la eliminación                                                  
   */
  static async deleteRole(roleId: bigint) {
    return await prisma.roles.update({
      where: { id: roleId },
      data: {
        deleted_at: new Date()
      }
    });
  }

  /**
   * Verifica si un rol existe
   * @param roleId - ID del rol
   * @returns true si existe, false si no
   */
  static async roleExists(roleId: bigint) {
    const role = await prisma.roles.findFirst({
      where: {
        id: roleId,
        deleted_at: null
      }
    });
    return !!role;
  }

  // ========== PERMISOS ==========

  /**
   * Crea un nuevo permiso
   * @param name - Nombre del permiso
   * @param guardName - Nombre del guard (por defecto 'web')
   * @returns El permiso creado
   */
    static async createPermission(resource: string, action: string, type: number = 0) {
    return await prisma.permissions.create({
      data: {
        resource,
        action,
        type,
        created_at: new Date(),
        updated_at: new Date()
      }
    });
  }

  /**
   * Obtiene todos los permisos usando SQL nativo
   * @returns Lista de permisos
   */
  static async getAllPermissions() {
    return await prisma.$queryRaw`
      SELECT 
        id,
        resource,
        action,
        type,
        created_at,
        updated_at
      FROM permissions
      WHERE deleted_at IS NULL
      ORDER BY resource, action
    ` as any[];
  }

  /**
   * Obtiene un permiso por ID
   * @param permissionId - ID del permiso
   * @returns Permiso encontrado
   */
  static async getPermissionById(permissionId: bigint) {
    return await prisma.permissions.findFirst({
      where: {
        id: permissionId,
        deleted_at: null
      }
    });
  }

  /**
   * Actualiza un permiso
   * @param permissionId - ID del permiso
   * @param name - Nuevo nombre del permiso
   * @param guardName - Nuevo guard name
   * @returns Permiso actualizado
   */
  static async updatePermission(permissionId: bigint, resource: string, action: string, type: number = 0) {
    return await prisma.permissions.update({
      where: { id: permissionId },
      data: {
        resource,
        action,
        type,
        updated_at: new Date()
      }
    });
  }

  /**
   * Elimina un permiso (soft delete)
   * @param permissionId - ID del permiso
   * @returns Resultado de la eliminación
   */
  static async deletePermission(permissionId: bigint) {
    return await prisma.permissions.update({
      where: { id: permissionId },
      data: {
        deleted_at: new Date()
      }
    });
  }

  /**
   * Verifica si un permiso existe
   * @param permissionId - ID del permiso
   * @returns true si existe, false si no
   */
  static async permissionExists(permissionId: bigint) {
    const permission = await prisma.permissions.findFirst({
      where: {
        id: permissionId,
        deleted_at: null
      }
    });
    return !!permission;
  }

  // ========== ASIGNACIÓN DE PERMISOS A ROLES ==========

  /**
   * Asigna permisos a un rol usando transacción
   * @param roleId - ID del rol
   * @param permissionIds - Array de IDs de permisos
   * @returns Resultado de la asignación
   */
  static async assignPermissionsToRole(roleId: bigint, permissionIds: bigint[]) {
    return await prisma.$transaction(async (tx) => {
      // Primero eliminamos todas las asignaciones existentes
      await tx.role_has_permissions.deleteMany({
        where: { role_id: roleId }
      });

      // Luego creamos las nuevas asignaciones
      if (permissionIds.length > 0) {
        const assignments = permissionIds.map(permissionId => ({
          role_id: roleId,
          permission_id: permissionId
        }));

        await tx.role_has_permissions.createMany({
          data: assignments
        });
      }

      return { success: true, assignedPermissions: permissionIds.length };
    });
  }

  /**
   * Obtiene los permisos de un rol específico usando SQL nativo
   * @param roleId - ID del rol
   * @returns Lista de permisos del rol
   */
  static async getRolePermissions(roleId: bigint) {
    return await prisma.$queryRaw`
      SELECT 
        p.id,
        p.resource,
        p.action,
        p.type,
        p.created_at,
        p.updated_at
      FROM permissions p
      INNER JOIN role_has_permissions rhp ON p.id = rhp.permission_id
      WHERE rhp.role_id = ${roleId} AND p.deleted_at IS NULL
      ORDER BY p.resource, p.action
    ` as any[];
  }

  /**
   * Verifica si un rol tiene un permiso específico
   * @param roleId - ID del rol
   * @param permissionId - ID del permiso
   * @returns true si tiene el permiso, false si no
   */
  static async roleHasPermission(roleId: bigint, permissionId: bigint) {
    const assignment = await prisma.role_has_permissions.findFirst({
      where: {
        role_id: roleId,
        permission_id: permissionId
      }
    });
    return !!assignment;
  }

  /**
   * Elimina un permiso específico de un rol
   * @param roleId - ID del rol
   * @param permissionId - ID del permiso
   * @returns Resultado de la eliminación
   */
  static async removePermissionFromRole(roleId: bigint, permissionId: bigint) {
    return await prisma.role_has_permissions.deleteMany({
      where: {
        role_id: roleId,
        permission_id: permissionId
      }
    });
  }

  // ========== MÉTODOS DE VALIDACIÓN ==========

  /**
   * Verifica si un nombre de rol ya existe
   * @param name - Nombre del rol
   * @param guardName - Guard name
   * @param excludeId - ID a excluir de la búsqueda (para actualizaciones)
   * @returns true si existe, false si no
   */
  static async roleNameExists(name: string, excludeId?: bigint) {
    const whereClause: any = {
      name,
      deleted_at: null
    };

    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const role = await prisma.roles.findFirst({ where: whereClause });
    return !!role;
  }

  /**
   * Verifica si un nombre de permiso ya existe
   * @param name - Nombre del permiso
   * @param guardName - Guard name
   * @param excludeId - ID a excluir de la búsqueda (para actualizaciones)
   * @returns true si existe, false si no
   */
  static async permissionNameExists(resource: string, action: string, type: number = 0, excludeId?: bigint) {
    const whereClause: any = {
      resource,
      action,
      type,
      deleted_at: null
    };

    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const permission = await prisma.permissions.findFirst({ where: whereClause });
    return !!permission;
  }
}
