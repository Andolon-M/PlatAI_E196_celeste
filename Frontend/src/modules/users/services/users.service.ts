import { axiosInstance } from "@/shared/api/axios.config"
import { API_ENDPOINTS } from "@/shared/api/enpoints"
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserStats,
  UserDetailedStats,
  UserFilters,
  PaginatedResponse,
  ApiResponse,
} from "../types"

export const usersService = {
  /**
   * Obtener usuarios con filtros opcionales
   * @param filters Filtros para la búsqueda
   * @returns Usuario específico o lista paginada de usuarios
   */
  async getUsers(
    filters?: UserFilters
  ): Promise<User | PaginatedResponse<User>> {
    const params = new URLSearchParams()
    
    if (filters?.id) params.append("id", filters.id)
    if (filters?.email) params.append("email", filters.email)
    if (filters?.role_id) params.append("role_id", filters.role_id)
    if (filters?.has_member !== undefined) params.append("has_member", String(filters.has_member))
    if (filters?.search) params.append("search", filters.search)
    if (filters?.page) params.append("page", String(filters.page))
    if (filters?.pageSize) params.append("pageSize", String(filters.pageSize))

    const queryString = params.toString()
    const url = queryString ? `${API_ENDPOINTS.USERS.LIST}?${queryString}` : API_ENDPOINTS.USERS.LIST
    
    const response = await axiosInstance.get<ApiResponse<User | PaginatedResponse<User>>>(url)
    
    return response.data.data
  },

  /**
   * Obtener usuario por ID
   * @param id ID del usuario
   * @returns Usuario específico
   */
  async getUserById(id: string): Promise<User> {
    const response = await axiosInstance.get<ApiResponse<User>>(
      `${API_ENDPOINTS.USERS.LIST}?id=${id}`
    )
    return response.data.data as User
  },

  /**
   * Crear nuevo usuario
   * @param data Datos del nuevo usuario
   * @returns Usuario creado
   */
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await axiosInstance.post<ApiResponse<User>>(
      API_ENDPOINTS.USERS.CREATE,
      data
    )
    return response.data.data
  },

  /**
   * Actualizar usuario existente
   * @param id ID del usuario
   * @param data Datos a actualizar
   * @returns Usuario actualizado
   */
  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    const response = await axiosInstance.put<ApiResponse<User>>(
      API_ENDPOINTS.USERS.UPDATE(id),
      data
    )
    return response.data.data
  },

  /**
   * Eliminar usuario (soft delete)
   * @param id ID del usuario
   */
  async deleteUser(id: string): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.USERS.DELETE(id))
  },

  /**
   * Obtener estadísticas generales de usuarios
   * @returns Estadísticas generales
   */
  async getStats(): Promise<UserStats> {
    const response = await axiosInstance.get<ApiResponse<UserStats>>(
      API_ENDPOINTS.USERS.STATS
    )
    return response.data.data
  },

  /**
   * Obtener estadísticas detalladas de un usuario específico
   * @param idOrEmail ID o email del usuario
   * @returns Estadísticas detalladas del usuario
   */
  async getUserStats(idOrEmail: string): Promise<UserDetailedStats> {
    const params = new URLSearchParams()
    
    // Detectar si es email o ID
    if (idOrEmail.includes("@")) {
      params.append("email", idOrEmail)
    } else {
      params.append("id", idOrEmail)
    }

    const response = await axiosInstance.get<ApiResponse<UserDetailedStats>>(
      `${API_ENDPOINTS.USERS.STATS}?${params.toString()}`
    )
    return response.data.data
  },
}
