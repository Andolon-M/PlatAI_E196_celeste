import { type ReactNode } from "react"
import { useAuth } from "@/shared/contexts/auth-context"

interface CanProps {
  resource: string
  action: string
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Componente para renderizado condicional basado en permisos
 * @example
 * <Can resource="users" action="create">
 *   <Button>Crear Usuario</Button>
 * </Can>
 */
export function Can({ resource, action, children, fallback = null }: CanProps) {
  const { hasPermission } = useAuth()

  if (!hasPermission(resource, action)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface CanAnyProps {
  permissions: { resource: string; action: string }[]
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Componente para renderizado condicional basado en múltiples permisos
 * @example
 * <CanAny permissions={[
 *   { resource: 'users', action: 'read' },
 *   { resource: 'users', action: 'update' }
 * ]}>
 *   <Button>Ver/Editar Usuarios</Button>
 * </CanAny>
 */
export function CanAny({ permissions, children, fallback = null }: CanAnyProps) {
  const { hasAnyPermission } = useAuth()

  if (!hasAnyPermission(permissions)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface HasRoleProps {
  role: string
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Componente para renderizado condicional basado en rol
 * @example
 * <HasRole role="Super Admin">
 *   <Button>Configuración Avanzada</Button>
 * </HasRole>
 */
export function HasRole({ role, children, fallback = null }: HasRoleProps) {
  const { hasRole } = useAuth()

  if (!hasRole(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

