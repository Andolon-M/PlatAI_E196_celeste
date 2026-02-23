import { Request, Response } from "express";
import { RolesPermissionsService } from "../services/roles-permissions.service";

/**
 * Controlador para manejar las operaciones de roles y permisos
 */
export class RolesPermissionsController {

  // ========== ROLES ==========

  /**
   * Crea un nuevo rol
   * @param req - Objeto de solicitud de Express
   * @param res - Objeto de respuesta de Express
   * @returns Respuesta con el rol creado o mensaje de error
   */
  static async createRole(req: Request, res: Response) {
    try {
      const { name, guard_name } = req.body;

      if (!name) {
        return res.status(400).json({
          status: 400,
          message: "El nombre del rol es requerido",
          data: { error: "Campo 'name' es obligatorio" }
        });
      }

      const role = await RolesPermissionsService.createRole({
        name,
        guard_name: guard_name || 'web'
      });

      return res.status(201).json({
        status: 201,
        message: "Rol creado exitosamente",
        data: { role }
      });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        message: "Error al crear rol",
        data: { error: (error as Error).message }
      });
    }
  }

  /**
   * Obtiene todos los roles con sus permisos
   * @param req - Objeto de solicitud de Express
   * @param res - Objeto de respuesta de Express
   * @returns Respuesta con la lista de roles
   */
  static async getAllRolesWithPermissions(req: Request, res: Response) {
    try {
      const roles = await RolesPermissionsService.getAllRolesWithPermissions();

      return res.status(200).json({
        status: 200,
        message: "Roles obtenidos exitosamente",
        data: { 
          roles,
          total: roles.length 
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Error al obtener roles",
        data: { error: (error as Error).message }
      });
    }
  }

  /**
   * Obtiene un rol por ID con sus permisos
   * @param req - Objeto de solicitud de Express
   * @param res - Objeto de respuesta de Express
   * @returns Respuesta con el rol encontrado
   */
  static async getRoleByIdWithPermissions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const roleId = BigInt(id);

      const role = await RolesPermissionsService.getRoleByIdWithPermissions(roleId);

      return res.status(200).json({
        status: 200,
        message: "Rol obtenido exitosamente",
        data: { role }
      });
    } catch (error) {
      const status = (error as Error).message.includes('no encontrado') ? 404 : 500;
      return res.status(status).json({
        status,
        message: "Error al obtener rol",
        data: { error: (error as Error).message }
      });
    }
  }

  /**
   * Actualiza un rol
   * @param req - Objeto de solicitud de Express
   * @param res - Objeto de respuesta de Express
   * @returns Respuesta con el rol actualizado
   */
  static async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, guard_name } = req.body;
      const roleId = BigInt(id);

      if (!name) {
        return res.status(400).json({
          status: 400,
          message: "El nombre del rol es requerido",
          data: { error: "Campo 'name' es obligatorio" }
        });
      }

      const role = await RolesPermissionsService.updateRole(roleId, {
        name,
        guard_name: guard_name || 'web'
      });

      return res.status(200).json({
        status: 200,
        message: "Rol actualizado exitosamente",
        data: { role }
      });
    } catch (error) {
      const status = (error as Error).message.includes('no encontrado') ? 404 : 400;
      return res.status(status).json({
        status,
        message: "Error al actualizar rol",
        data: { error: (error as Error).message }
      });
    }
  }

  /**
   * Elimina un rol
   * @param req - Objeto de solicitud de Express
   * @param res - Objeto de respuesta de Express
   * @returns Respuesta de confirmación
   */
  static async deleteRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const roleId = BigInt(id);

      await RolesPermissionsService.deleteRole(roleId);

      return res.status(200).json({
        status: 200,
        message: "Rol eliminado exitosamente",
        data: {}
      });
    } catch (error) {
      const status = (error as Error).message.includes('no encontrado') ? 404 : 500;
      return res.status(status).json({
        status,
        message: "Error al eliminar rol",
        data: { error: (error as Error).message }
      });
    }
  }

  // ========== PERMISOS ==========

  /**
   * Crea un nuevo permiso
   * @param req - Objeto de solicitud de Express
   * @param res - Objeto de respuesta de Express
   * @returns Respuesta con el permiso creado
   */
  static async createPermission(req: Request, res: Response) {
    try {
      const { name, guard_name } = req.body;

      if (!name) {
        return res.status(400).json({
          status: 400,
          message: "El nombre del permiso es requerido",
          data: { error: "Campo 'name' es obligatorio" }
        });
      }

      const permission = await RolesPermissionsService.createPermission({
        name,
        guard_name: guard_name || 'web'
      });

      return res.status(201).json({
        status: 201,
        message: "Permiso creado exitosamente",
        data: { permission }
      });
    } catch (error) {
      return res.status(400).json({
        status: 400,
        message: "Error al crear permiso",
        data: { error: (error as Error).message }
      });
    }
  }

  /**
   * Obtiene todos los permisos
   * @param req - Objeto de solicitud de Express
   * @param res - Objeto de respuesta de Express
   * @returns Respuesta con la lista de permisos
   */
  static async getAllPermissions(req: Request, res: Response) {
    try {
      const permissions = await RolesPermissionsService.getAllPermissions();

      return res.status(200).json({
        status: 200,
        message: "Permisos obtenidos exitosamente",
        data: { 
          permissions,
          total: permissions.length 
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Error al obtener permisos",
        data: { error: (error as Error).message }
      });
    }
  }

  /**
   * Obtiene un permiso por ID
   * @param req - Objeto de solicitud de Express
   * @param res - Objeto de respuesta de Express
   * @returns Respuesta con el permiso encontrado
   */
  static async getPermissionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const permissionId = BigInt(id);

      const permission = await RolesPermissionsService.getPermissionById(permissionId);

      return res.status(200).json({
        status: 200,
        message: "Permiso obtenido exitosamente",
        data: { permission }
      });
    } catch (error) {
      const status = (error as Error).message.includes('no encontrado') ? 404 : 500;
      return res.status(status).json({
        status,
        message: "Error al obtener permiso",
        data: { error: (error as Error).message }
      });
    }
  }

  /**
   * Actualiza un permiso
   * @param req - Objeto de solicitud de Express
   * @param res - Objeto de respuesta de Express
   * @returns Respuesta con el permiso actualizado
   */
  static async updatePermission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, guard_name } = req.body;
      const permissionId = BigInt(id);

      if (!name) {
        return res.status(400).json({
          status: 400,
          message: "El nombre del permiso es requerido",
          data: { error: "Campo 'name' es obligatorio" }
        });
      }

      const permission = await RolesPermissionsService.updatePermission(permissionId, {
        name,
        guard_name: guard_name || 'web'
      });

      return res.status(200).json({
        status: 200,
        message: "Permiso actualizado exitosamente",
        data: { permission }
      });
    } catch (error) {
      const status = (error as Error).message.includes('no encontrado') ? 404 : 400;
      return res.status(status).json({
        status,
        message: "Error al actualizar permiso",
        data: { error: (error as Error).message }
      });
    }
  }

  /**
   * Elimina un permiso
   * @param req - Objeto de solicitud de Express
   * @param res - Objeto de respuesta de Express
   * @returns Respuesta de confirmación
   */
  static async deletePermission(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const permissionId = BigInt(id);

      await RolesPermissionsService.deletePermission(permissionId);

      return res.status(200).json({
        status: 200,
        message: "Permiso eliminado exitosamente",
        data: {}
      });
    } catch (error) {
      const status = (error as Error).message.includes('no encontrado') ? 404 : 500;
      return res.status(status).json({
        status,
        message: "Error al eliminar permiso",
        data: { error: (error as Error).message }
      });
    }
  }

  // ========== ASIGNACIÓN DE PERMISOS A ROLES ==========

  /**
   * Asigna permisos a un rol
   * @param req - Objeto de solicitud de Express
   * @param res - Objeto de respuesta de Express
   * @returns Respuesta de confirmación
   */
  static async assignPermissionsToRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { permission_ids } = req.body;
      const roleId = BigInt(id);

      if (!permission_ids || !Array.isArray(permission_ids)) {
        return res.status(400).json({
          status: 400,
          message: "Los IDs de permisos son requeridos",
          data: { error: "Campo 'permission_ids' debe ser un array" }
        });
      }

      // Convertir strings a BigInt si es necesario
      const permissionIdsBigInt = permission_ids.map((id: string | number) => BigInt(id));

      const result = await RolesPermissionsService.assignPermissionsToRole(roleId, {
        permission_ids: permissionIdsBigInt
      });

      return res.status(200).json({
        status: 200,
        message: "Permisos asignados exitosamente al rol",
        data: { 
          assigned_permissions: result.assignedPermissions,
          total_permissions: permission_ids.length
        }
      });
    } catch (error) {
      const status = (error as Error).message.includes('no encontrado') ? 404 : 400;
      return res.status(status).json({
        status,
        message: "Error al asignar permisos al rol",
        data: { error: (error as Error).message }
      });
    }
  }

  /**
   * Obtiene los permisos de un rol
   * @param req - Objeto de solicitud de Express
   * @param res - Objeto de respuesta de Express
   * @returns Respuesta con los permisos del rol
   */
  static async getRolePermissions(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const roleId = BigInt(id);

      const permissions = await RolesPermissionsService.getRolePermissions(roleId);

      return res.status(200).json({
        status: 200,
        message: "Permisos del rol obtenidos exitosamente",
        data: { 
          permissions,
          total: permissions.length 
        }
      });
    } catch (error) {
      const status = (error as Error).message.includes('no encontrado') ? 404 : 500;
      return res.status(status).json({
        status,
        message: "Error al obtener permisos del rol",
        data: { error: (error as Error).message }
      });
    }
  }

  /**
   * Elimina un permiso específico de un rol
   * @param req - Objeto de solicitud de Express
   * @param res - Objeto de respuesta de Express
   * @returns Respuesta de confirmación
   */
  static async removePermissionFromRole(req: Request, res: Response) {
    try {
      const { roleId, permissionId } = req.params;
      const roleIdBigInt = BigInt(roleId);
      const permissionIdBigInt = BigInt(permissionId);

      await RolesPermissionsService.removePermissionFromRole(roleIdBigInt, permissionIdBigInt);

      return res.status(200).json({
        status: 200,
        message: "Permiso eliminado del rol exitosamente",
        data: {}
      });
    } catch (error) {
      const status = (error as Error).message.includes('no encontrado') ? 404 : 400;
      return res.status(status).json({
        status,
        message: "Error al eliminar permiso del rol",
        data: { error: (error as Error).message }
      });
    }
  }

  // ========== MÉTODOS DE UTILIDAD ==========

  /**
   * Obtiene estadísticas del sistema de roles y permisos
   * @param req - Objeto de solicitud de Express
   * @param res - Objeto de respuesta de Express
   * @returns Respuesta con las estadísticas
   */
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await RolesPermissionsService.getStats();

      return res.status(200).json({
        status: 200,
        message: "Estadísticas obtenidas exitosamente",
        data: { stats }
      });
    } catch (error) {
      return res.status(500).json({
        status: 500,
        message: "Error al obtener estadísticas",
        data: { error: (error as Error).message }
      });
    }
  }
}
