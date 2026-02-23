import { axiosInstance, API_ENDPOINTS, type ApiResponse } from "@/shared/api"
import type { LoginCredentials, RegisterData, AuthResponse, AuthMeResponse, ForgotPasswordData, ResetPasswordData, VerifyTokenResponse } from "../types"

export const authService = {
  async login(credentials: LoginCredentials): Promise<string> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    )
    
    const { token } = response.data.data
    
    // Guardar token en localStorage
    this.setToken(token)
    
    return token
  },

  async register(data: RegisterData): Promise<string> {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    )
    
    const { token } = response.data.data
    
    // Guardar token en localStorage
    this.setToken(token)
    
    return token
  },

  async forgotPassword(data: ForgotPasswordData): Promise<void> {
    await axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data
    )
  },

  async resetPassword(data: ResetPasswordData): Promise<void> {
    await axiosInstance.post<ApiResponse>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    )
  },

  async verifyToken(token: string): Promise<VerifyTokenResponse> {
    const response = await axiosInstance.get<VerifyTokenResponse>(
      API_ENDPOINTS.AUTH.VERIFY_TOKEN(token)
    )
    // El backend devuelve directamente el objeto, no dentro de data.data
    return response.data
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUTH.LOGOUT)
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      // Limpiar datos locales siempre
      this.clearAuth()
    }
  },

  async getMe(): Promise<AuthMeResponse> {
    const response = await axiosInstance.get<ApiResponse<AuthMeResponse>>(
      API_ENDPOINTS.AUTH.ME
    )
    
    return response.data.data
  },

  getToken(): string | null {
    return localStorage.getItem("token")
  },

  setToken(token: string): void {
    localStorage.setItem("token", token)
  },

  clearAuth(): void {
    localStorage.removeItem("token")
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },
}

