// Tipos basados en la API del backend

export interface User {
  id: string
  email: string
  email_verified_at: string | null
  google_id: string | null
  image: string | null
  role_id: string
  created_at: string
  updated_at: string
  role_name: string
  member_id: string | null
  name: string | null
  last_name: string | null
  dni: string | null
  member_status: "ASISTENTE" | "ACTIVO" | "INACTIVO" | null
  work_teams_count: number
  team_memberships_count: number
}

export interface CreateUserRequest {
  email: string
  password?: string
  google_id?: string
  image?: string
  role_id?: string
  email_verified_at?: string
}

export interface UpdateUserRequest {
  email?: string
  password?: string
  google_id?: string
  image?: string
  role_id?: string
  email_verified_at?: string
}

//sin uso
export interface UserStats {
  total_users: number
  verified_users: number
  unverified_users: number
  google_users: number
  password_users: number
  total_roles: number
}

export interface UserDetailedStats {
  work_teams_created: number
  team_memberships: number
}

export interface UserFilters {
  id?: string
  email?: string
  role_id?: string
  has_member?: boolean
  search?: string
  page?: number
  pageSize?: number
}

// Estructura de paginación que devuelve el backend
export interface PaginatedResponse<T> {
  previousPage: number | null
  currentPage: number
  nextPage: number | null
  total: number
  totalPages: number
  limit: number
  data: T[]
}

export interface ApiResponse<T> {
  status: number
  message: string
  data: T
}

// Tipos para UI
export interface Role {
  id: string
  name: string
}
