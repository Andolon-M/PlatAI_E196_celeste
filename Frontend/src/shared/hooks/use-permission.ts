import { useAuth } from "@/shared/contexts/auth-context"

/**
 * Hook personalizado para verificar permisos
 * @example
 * const { can, canAny, isRole } = usePermission()
 * 
 * if (can('users', 'create')) {
 *   // Mostrar botón de crear usuario
 * }
 */
export function usePermission() {
  const { hasPermission, hasAnyPermission, hasRole } = useAuth()

  return {
    /**
     * Verifica si el usuario tiene un permiso específico
     * @param resource - El recurso (ej: 'users', 'events', 'members')
     * @param action - La acción (ej: 'create', 'read', 'update', 'delete')
     */
    can: (resource: string, action: string) => hasPermission(resource, action),

    /**
     * Verifica si el usuario tiene al menos uno de los permisos especificados
     * @param permissions - Array de permisos a verificar
     */
    canAny: (permissions: { resource: string; action: string }[]) => 
      hasAnyPermission(permissions),

    /**
     * Verifica si el usuario tiene un rol específico
     * @param roleName - Nombre del rol (ej: 'Super Admin', 'Admin', 'User')
     */
    isRole: (roleName: string) => hasRole(roleName),
  }
}

