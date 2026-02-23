// Tipos basados en la API del backend

export interface Permission {
  id: string
  resource: string
  action: string
  type: number
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  name: string
  created_at: string
  updated_at: string
  permissions: Permission[]
}

export interface RolesStats {
  total_roles: number
  total_permissions: number
  roles_with_permissions: number
  roles_without_permissions: number
}

export interface CreateRoleData {
  name: string
  permissions?: string[]
}

export interface UpdateRoleData extends Partial<CreateRoleData> {}

export interface ApiResponse<T> {
  status: number
  message: string
  data: T
}

// Respuesta específica para la lista de roles desde el backend
export interface RolesListResponse {
  roles: Role[]
}
