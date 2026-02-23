import { axiosInstance } from "@/shared/api/axios.config"
import { API_ENDPOINTS } from "@/shared/api/enpoints"
import type { Role, Permission, RolesStats, CreateRoleData, UpdateRoleData, ApiResponse, RolesListResponse } from "../types"

export const rolesService = {
  /**
   * Obtener todos los roles con sus permisos
   * @returns Lista de roles con permisos asociados
   */
  async getAllRoles(): Promise<Role[]> {
    const response = await axiosInstance.get<ApiResponse<RolesListResponse>>(API_ENDPOINTS.ROLES.LIST)
    // El backend devuelve: { status, message, data: { roles: [...] } }
    return response.data.data.roles
  },

  /**
   * Obtener rol por ID con sus permisos
   * @param id ID del rol
   * @returns Rol con permisos asociados
   */
  async getRoleById(id: string): Promise<Role> {
    const response = await axiosInstance.get<ApiResponse<Role>>(API_ENDPOINTS.ROLES.GET(id))
    return response.data.data
  },

  /**
   * Obtener permisos de un rol específico
   * @param roleId ID del rol
   * @returns Lista de permisos del rol
   */
  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const response = await axiosInstance.get<ApiResponse<Permission[]>>(
      API_ENDPOINTS.ROLES.PERMISSIONS(roleId)
    )
    return response.data.data
  },

  /**
   * Obtener estadísticas de roles y permisos
   * @returns Estadísticas generales del sistema
   */
  async getStats(): Promise<RolesStats> {
    const response = await axiosInstance.get<ApiResponse<RolesStats>>(API_ENDPOINTS.ROLES.STATS)
    return response.data.data
  },

  /**
   * Crear nuevo rol
   * @param data Datos del nuevo rol
   * @returns Rol creado
   */
  async createRole(data: CreateRoleData): Promise<Role> {
    const response = await axiosInstance.post<ApiResponse<Role>>(API_ENDPOINTS.ROLES.CREATE, data)
    return response.data.data
  },

  /**
   * Actualizar rol existente
   * @param id ID del rol
   * @param data Datos a actualizar
   * @returns Rol actualizado
   */
  async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
    const response = await axiosInstance.put<ApiResponse<Role>>(API_ENDPOINTS.ROLES.UPDATE(id), data)
    return response.data.data
  },

  /**
   * Eliminar rol
   * @param id ID del rol
   */
  async deleteRole(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.ROLES.DELETE(id))
  },
}

