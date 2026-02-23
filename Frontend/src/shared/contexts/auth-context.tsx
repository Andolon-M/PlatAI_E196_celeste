import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { authService } from "@/modules/auth/services/auth.service"
import type { User, Permission } from "@/modules/auth/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  hasPermission: (resource: string, action: string) => boolean
  hasAnyPermission: (permissions: { resource: string; action: string }[]) => boolean
  hasRole: (roleName: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Función para cargar los datos del usuario
  const loadUser = async () => {
    try {
      const token = authService.getToken()
      
      if (!token) {
        setUser(null)
        return
      }

      const userData = await authService.getMe()
      setUser(userData)
    } catch (error) {
      console.error("Error al cargar usuario:", error)
      setUser(null)
      authService.clearAuth()
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar usuario al montar el componente
  useEffect(() => {
    loadUser()
  }, [])

  // Login: guardar token y cargar usuario
  const login = async (token: string) => {
    authService.setToken(token)
    await loadUser()
  }

  // Logout: limpiar datos y redirigir
  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      setUser(null)
      authService.clearAuth()
      navigate("/login")
    }
  }

  // Refrescar datos del usuario
  const refreshUser = async () => {
    setIsLoading(true)
    await loadUser()
  }

  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false
    
    return user.permissions.some(
      (permission: Permission) =>
        permission.resource === resource && permission.action === action
    )
  }

  // Verificar si el usuario tiene al menos uno de los permisos
  const hasAnyPermission = (permissions: { resource: string; action: string }[]): boolean => {
    if (!user) return false
    
    return permissions.some(({ resource, action }) =>
      hasPermission(resource, action)
    )
  }

  // Verificar si el usuario tiene un rol específico
  const hasRole = (roleName: string): boolean => {
    if (!user) return false
    return user.role.name === roleName
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
    hasPermission,
    hasAnyPermission,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  
  return context
}

