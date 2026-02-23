import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/shared/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requirePermission?: {
    resource: string
    action: string
  }
  requireRole?: string
}

export function ProtectedRoute({ 
  children, 
  requirePermission,
  requireRole 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth()
  const location = useLocation()

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Verificar permiso específico si es requerido
  if (requirePermission) {
    const hasRequiredPermission = hasPermission(
      requirePermission.resource,
      requirePermission.action
    )

    if (!hasRequiredPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
            <p className="text-muted-foreground mb-6">
              No tienes permisos para acceder a esta sección.
            </p>
            <p className="text-sm text-muted-foreground">
              Permiso requerido: <strong>{requirePermission.resource}.{requirePermission.action}</strong>
            </p>
          </div>
        </div>
      )
    }
  }

  // Verificar rol específico si es requerido
  if (requireRole) {
    const hasRequiredRole = hasRole(requireRole)

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
            <p className="text-muted-foreground mb-6">
              No tienes el rol necesario para acceder a esta sección.
            </p>
            <p className="text-sm text-muted-foreground">
              Rol requerido: <strong>{requireRole}</strong>
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

