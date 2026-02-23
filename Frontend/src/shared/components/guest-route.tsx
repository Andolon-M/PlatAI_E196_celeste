import { Navigate } from "react-router-dom"
import { useAuth } from "@/shared/contexts/auth-context"
import { Loader2 } from "lucide-react"

interface GuestRouteProps {
  children: React.ReactNode
}

/**
 * Componente para rutas que solo pueden acceder usuarios NO autenticados
 * Si el usuario está autenticado, lo redirige al admin
 */
export function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Si está autenticado, redirigir al admin
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}

