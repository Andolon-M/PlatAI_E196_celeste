import { prisma } from '../../../../config/database/db';

/**
 * Repositorio para gestionar roles y permisos (Mapeado a Suscripciones y Capacidades)
 */
export class RolesPermissionsRepository {
  
  // ========== ROLES (Suscripciones) ==========
  
  /**
   * Crea un nuevo rol
   * @param name - Nombre del rol
   * @returns El rol creado
   */
  static async createRole(name: string) {
    return await prisma.subscriptions.create({
      data: {
        name,
        price: 0.00
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
        s.id,
        s.name,
        CAST(s.price AS DOUBLE) as price,
        s.created_at,
        s.updated_at,
        GROUP_CONCAT(
          CONCAT(
            '{"id":', c.id, 
            ',"resource":"', c.resource, 
            '","action":"', c.action,
            '","type":', c.type, 
            ',"created_at":"', c.created_at, 
            '","updated_at":"', c.updated_at, '"}'
          ) SEPARATOR ','
        ) as permissions_json
      FROM subscriptions s
      LEFT JOIN subscription_capabilities sc ON s.id = sc.subscription_id
      LEFT JOIN capabilities c ON sc.capability_id = c.id
      GROUP BY s.id, s.name, s.price, s.created_at, s.updated_at
      ORDER BY s.name
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
        s.id,
        s.name,
        CAST(s.price AS DOUBLE) as price,
        s.created_at,
        s.updated_at,
        GROUP_CONCAT(
          CONCAT(
            '{"id":', c.id, 
            ',"resource":"', c.resource, 
            '","action":"', c.action,
            '","type":', c.type, 
            ',"created_at":"', c.created_at, 
            '","updated_at":"', c.updated_at, '"}'
          ) SEPARATOR ','
        ) as permissions_json
      FROM subscriptions s
      LEFT JOIN subscription_capabilities sc ON s.id = sc.subscription_id
      LEFT JOIN capabilities c ON sc.capability_id = c.id
      WHERE s.id = ${roleId}
      GROUP BY s.id, s.name, s.price, s.created_at, s.updated_at
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
   * @returns Rol actualizado
   */
  static async updateRole(roleId: bigint, name: string) {
    return await prisma.subscriptions.update({
      where: { id: roleId },
      data: {
        name,
        updated_at: new Date()
      }
    });
  }

  /**
   * Elimina un rol (físicamente, al no haber soft delete en subscriptions)
   * @param roleId - ID del rol
   * @returns Resultado de la eliminación                                                  
   */
  static async deleteRole(roleId: bigint) {
    return await prisma.subscriptions.delete({
      where: { id: roleId }
    });
  }

  /**
   * Verifica si un rol existe
   * @param roleId - ID del rol
   * @returns true si existe, false si no
   */
  static async roleExists(roleId: bigint) {
    const role = await prisma.subscriptions.findFirst({
      where: {
        id: roleId
      }
    });
    return !!role;
  }

  // ========== PERMISOS (Capacidades) ==========

  /**
   * Crea un nuevo permiso
   * @returns El permiso creado
   */
  static async createPermission(resource: string, action: string, type: number = 0) {
    return await prisma.capabilities.create({
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
      FROM capabilities
      ORDER BY resource, action
    ` as any[];
  }

  /**
   * Obtiene un permiso por ID
   * @param permissionId - ID del permiso
   * @returns Permiso encontrado
   */
  static async getPermissionById(permissionId: bigint) {
    return await prisma.capabilities.findFirst({
      where: {
        id: permissionId
      }
    });
  }

  /**
   * Actualiza un permiso
   * @returns Permiso actualizado
   */
  static async updatePermission(permissionId: bigint, resource: string, action: string, type: number = 0) {
    return await prisma.capabilities.update({
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
   * Elimina un permiso (físicamente)
   * @param permissionId - ID del permiso
   * @returns Resultado de la eliminación
   */
  static async deletePermission(permissionId: bigint) {
    return await prisma.capabilities.delete({
      where: { id: permissionId }
    });
  }

  /**
   * Verifica si un permiso existe
   * @param permissionId - ID del permiso
   * @returns true si existe, false si no
   */
  static async permissionExists(permissionId: bigint) {
    const permission = await prisma.capabilities.findFirst({
      where: {
        id: permissionId
      }
    });
    return !!permission;
  }

  // ========== ASIGNACIÓN DE CAPACIDADES A PLANES ==========

  /**
   * Asigna capacidades a un plan usando transacción
   * @param roleId - ID del plan (suscripción)
   * @param permissionIds - Array de IDs de capacidades
   * @returns Resultado de la asignación
   */
  static async assignPermissionsToRole(roleId: bigint, permissionIds: bigint[]) {
    return await prisma.$transaction(async (tx) => {
      // Primero eliminamos todas las asignaciones existentes
      await tx.subscription_capabilities.deleteMany({
        where: { subscription_id: roleId }
      });

      // Luego creamos las nuevas asignaciones
      if (permissionIds.length > 0) {
        const assignments = permissionIds.map(permissionId => ({
          subscription_id: roleId,
          capability_id: permissionId
        }));

        await tx.subscription_capabilities.createMany({
          data: assignments
        });
      }

      return { success: true, assignedPermissions: permissionIds.length };
    });
  }

  /**
   * Obtiene las capacidades de un plan específico usando SQL nativo
   * @param roleId - ID del plan (suscripción)
   * @returns Lista de capacidades del plan
   */
  static async getRolePermissions(roleId: bigint) {
    return await prisma.$queryRaw`
      SELECT 
        c.id,
        c.resource,
        c.action,
        c.type,
        c.created_at,
        c.updated_at
      FROM capabilities c
      INNER JOIN subscription_capabilities sc ON c.id = sc.capability_id
      WHERE sc.subscription_id = ${roleId}
      ORDER BY c.resource, c.action
    ` as any[];
  }

  /**
   * Verifica si un plan tiene una capacidad específica
   * @param roleId - ID del plan
   * @param permissionId - ID de la capacidad
   * @returns true si tiene el permiso, false si no
   */
  static async roleHasPermission(roleId: bigint, permissionId: bigint) {
    const assignment = await prisma.subscription_capabilities.findFirst({
      where: {
        subscription_id: roleId,
        capability_id: permissionId
      }
    });
    return !!assignment;
  }

  /**
   * Elimina una capacidad específica de un plan
   * @param roleId - ID del plan
   * @param permissionId - ID de la capacidad
   * @returns Resultado de la eliminación
   */
  static async removePermissionFromRole(roleId: bigint, permissionId: bigint) {
    return await prisma.subscription_capabilities.deleteMany({
      where: {
        subscription_id: roleId,
        capability_id: permissionId
      }
    });
  }

  // ========== MÉTODOS DE VALIDACIÓN ==========

  /**
   * Verifica si un nombre de plan ya existe
   * @param name - Nombre del plan
   * @param excludeId - ID a excluir de la búsqueda (para actualizaciones)
   * @returns true si existe, false si no
   */
  static async roleNameExists(name: string, excludeId?: bigint) {
    const whereClause: any = {
      name
    };

    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const role = await prisma.subscriptions.findFirst({ where: whereClause });
    return !!role;
  }

  /**
   * Verifica si un nombre de capacidad ya existe
   * @param excludeId - ID a excluir de la búsqueda
   * @returns true si existe, false si no
   */
  static async permissionNameExists(resource: string, action: string, type: number = 0, excludeId?: bigint) {
    const whereClause: any = {
      resource,
      action,
      type
    };

    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const permission = await prisma.capabilities.findFirst({ where: whereClause });
    return !!permission;
  }
}
