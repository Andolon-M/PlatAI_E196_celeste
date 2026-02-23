import { prisma } from '../../../config/database/db';

/**
 * Interfaz para representar un permiso de usuario
 */
export interface UserPermission {
  id: bigint;
  resource: string;
  action: string;
  type: number;
  created_at: Date | null;
  updated_at: Date | null;
}

/**
 * Interfaz para representar un rol de usuario
 */
export interface UserRole {
  id: bigint;
  name: string;
  created_at: Date | null;
  updated_at: Date | null;
}

/**
 * Interfaz para representar un usuario con su rol y permisos
 */
export interface UserWithPermissions {
  id: bigint;
  email: string;
  role: UserRole | null;
  permissions: UserPermission[];
}

/**
 * Repositorio para consultar permisos de usuarios
 * Ubicado en la capa shared para ser usado por middlewares de autenticación
 */
export class UserPermissionsRepository {

  /**
   * Obtiene todos los permisos de un usuario específico usando SQL nativo
   * Lógica: Usuario -> Rol -> Permisos
   * @param userId - ID del usuario
   * @returns Lista de permisos del usuario
   */
  static async getUserPermissions(userId: bigint): Promise<UserPermission[]> {
    const permissions = await prisma.$queryRaw`
      SELECT DISTINCT
        p.id,
        p.resource,
        p.action,
        p.type,
        p.created_at,
        p.updated_at
      FROM permissions p
      INNER JOIN role_has_permissions rhp ON p.id = rhp.permission_id
      INNER JOIN users u ON rhp.role_id = u.role_id
      WHERE u.id = ${userId} 
        AND p.deleted_at IS NULL 
        AND u.deleted_at IS NULL
        AND u.role_id IS NOT NULL
      ORDER BY p.resource, p.action
    ` as UserPermission[];

    return permissions;
  }

  /**
   * Obtiene el rol de un usuario específico usando SQL nativo
   * @param userId - ID del usuario
   * @returns Rol del usuario o null si no tiene rol
   */
  static async getUserRole(userId: bigint): Promise<UserRole | null> {
    const result = await prisma.$queryRaw`
      SELECT 
        r.id,
        r.name,
        r.created_at,
        r.updated_at
      FROM roles r
      INNER JOIN users u ON r.id = u.role_id
      WHERE u.id = ${userId} 
        AND r.deleted_at IS NULL 
        AND u.deleted_at IS NULL
        AND u.role_id IS NOT NULL
    ` as UserRole[];

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Obtiene un usuario completo con su rol y permisos usando SQL nativo
   * Lógica: Usuario -> Rol -> Permisos (carga todo en una consulta optimizada)
   * @param userId - ID del usuario
   * @returns Usuario con rol y permisos
   */
  static async getUserWithPermissions(userId: bigint): Promise<UserWithPermissions | null> {
    // Primero obtener la información básica del usuario
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true
      }
    });

    if (!user) {
      return null;
    }

    // Obtener rol y permisos en paralelo
    const [role, permissions] = await Promise.all([
      this.getUserRole(userId),
      this.getUserPermissions(userId)
    ]);

    return {
      id: user.id,
      email: user.email,
      role,
      permissions
    };
  }

  /**
   * Verifica si un usuario tiene un permiso específico
   * Lógica: Usuario -> Rol -> Permiso específico
   * @param userId - ID del usuario
   * @param resource - Recurso del permiso (ej: 'users', 'events')
   * @param action - Acción del permiso (ej: 'create', 'read', 'update', 'delete')
   * @param type - Tipo del permiso (opcional, por defecto 0)
   * @returns true si tiene el permiso, false si no
   */
  static async userHasPermission(userId: bigint, resource: string, action: string, type: number = 0): Promise<boolean> {
    const result = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM permissions p
      INNER JOIN role_has_permissions rhp ON p.id = rhp.permission_id
      INNER JOIN users u ON rhp.role_id = u.role_id
      WHERE u.id = ${userId} 
        AND p.resource = ${resource}
        AND p.action = ${action}
        AND p.type = ${type}
        AND p.deleted_at IS NULL 
        AND u.deleted_at IS NULL
        AND u.role_id IS NOT NULL
    ` as [{ count: bigint }[]];

    return result[0][0].count > 0;
  }

  /**
   * Verifica si un usuario tiene un rol específico
   * @param userId - ID del usuario
   * @param roleName - Nombre del rol
   * @returns true si tiene el rol, false si no
   */
  static async userHasRole(userId: bigint, roleName: string): Promise<boolean> {
    const result = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM roles r
      INNER JOIN users u ON r.id = u.role_id
      WHERE u.id = ${userId} 
        AND r.name = ${roleName}
        AND r.deleted_at IS NULL 
        AND u.deleted_at IS NULL
        AND u.role_id IS NOT NULL
    ` as [{ count: bigint }[]];

    return result[0][0].count > 0;
  }

  /**
   * Asigna un rol a un usuario
   * @param userId - ID del usuario
   * @param roleId - ID del rol
   * @returns Resultado de la asignación
   */
  static async assignRoleToUser(userId: bigint, roleId: bigint) {
    
    return await prisma.users.update({
      where: { id: userId },
      data: {
        role_id: roleId,
        updated_at: new Date()
      }
    });
  }

  /**
   * Elimina el rol de un usuario
   * @param userId - ID del usuario
   * @returns Resultado de la eliminación
   */
  static async removeRoleFromUser(userId: bigint) {
    
    return await prisma.users.update({
      where: { id: userId },
      data: {
        role_id: null,
        updated_at: new Date()
      }
    });
  }

  /**
   * Obtiene estadísticas de permisos de un usuario
   * @param userId - ID del usuario
   * @returns Estadísticas del usuario
   */
  static async getUserStats(userId: bigint) {
    const [role, permissions] = await Promise.all([
      this.getUserRole(userId),
      this.getUserPermissions(userId)
    ]);

    return {
      has_role: !!role,
      role_name: role?.name || null,
      total_permissions: permissions.length,
      permissions: permissions.map(permission => `${permission.resource}.${permission.action}`)
    };
  }
}
