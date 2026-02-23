export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  acceptTerms: boolean
}

export interface Permission {
  id: string
  resource: string
  action: "create" | "read" | "update" | "delete"
  type: number
}

export interface Role {
  id: string
  name: string
}

export interface User {
  userId: string
  email: string
  role: Role
  permissions: Permission[]
}

export interface AuthResponse {
  token: string
}

export interface AuthMeResponse {
  userId: string
  email: string
  role: Role
  permissions: Permission[]
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface VerifyTokenResponse {
  status: number
  valid: boolean
  message: string
}

