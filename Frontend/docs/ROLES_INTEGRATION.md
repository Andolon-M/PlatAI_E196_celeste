# Integración del Módulo de Roles con el Backend

## 📋 Resumen

El módulo de roles ha sido completamente integrado con el backend de la API. Todos los componentes, servicios y hooks utilizan correctamente los endpoints definidos en `enpoints.ts`.

## 🔄 Cambios Implementados

### 1. **Endpoints Configurados** (`src/shared/api/enpoints.ts`)

Se actualizaron los endpoints de roles para usar las rutas correctas bajo `/auth`:

```typescript
ROLES: {
  LIST: "/auth/roles",                              // GET - Todos los roles con permisos
  CREATE: "/auth/roles",                            // POST - Crear rol
  UPDATE: (id: string) => `/auth/roles/${id}`,     // PUT - Actualizar rol
  DELETE: (id: string) => `/auth/roles/${id}`,     // DELETE - Eliminar rol
  GET: (id: string) => `/auth/roles/${id}`,        // GET - Rol específico
  PERMISSIONS: (roleId: string) => `/auth/roles/${roleId}/permissions`,  // GET - Permisos del rol
  STATS: "/auth/roles-permissions/stats",          // GET - Estadísticas
}
```

### 2. **Types** (`src/modules/roles/types/index.ts`)

Se actualizaron todos los tipos para que coincidan con la API del backend:

```typescript
export interface Permission {
  id: string
  resource: string        // Ej: "users", "members", "events"
  action: string          // Ej: "create", "read", "update", "delete"
  type: number           // 0 = básico
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  name: string
  created_at: string
  updated_at: string
  permissions: Permission[]  // Array de permisos asociados
}

export interface RolesStats {
  total_roles: number
  total_permissions: number
  roles_with_permissions: number
  roles_without_permissions: number
}

export interface CreateRoleData {
  name: string
  permissions?: string[]  // IDs de permisos a asignar
}

export interface UpdateRoleData extends Partial<CreateRoleData> {}
```

### 3. **Service** (`src/modules/roles/services/roles.service.ts`)

Implementación completa de todos los endpoints usando las constantes de `API_ENDPOINTS`:

```typescript
export const rolesService = {
  // Obtener todos los roles con permisos
  getAllRoles(): Promise<Role[]>
  
  // Obtener rol específico por ID con permisos
  getRoleById(id: string): Promise<Role>
  
  // Obtener permisos de un rol específico
  getRolePermissions(roleId: string): Promise<Permission[]>
  
  // Obtener estadísticas de roles y permisos
  getStats(): Promise<RolesStats>
  
  // Crear nuevo rol
  createRole(data: CreateRoleData): Promise<Role>
  
  // Actualizar rol existente
  updateRole(id: string, data: UpdateRoleData): Promise<Role>
  
  // Eliminar rol
  deleteRole(id: string): Promise<void>
}
```

### 4. **Hooks** (`src/modules/roles/hooks/use-roles.ts`)

Se crearon dos hooks personalizados:

#### `useRoles()` - Hook Completo
Hook principal para manejo completo de roles con operaciones CRUD:

```typescript
const {
  roles,              // Lista de roles con permisos
  stats,              // Estadísticas del sistema
  isLoading,          // Estado de carga
  error,              // Error si ocurre
  refetch,            // Función para recargar datos
  createRole,         // Crear nuevo rol
  updateRole,         // Actualizar rol
  deleteRole,         // Eliminar rol
  getRolePermissions  // Obtener permisos de un rol específico
} = useRoles()
```

#### `useRolesList()` - Hook Simplificado
Hook ligero solo para obtener lista de roles (útil para selects y dropdowns):

```typescript
const {
  roles,      // Lista de roles
  isLoading,  // Estado de carga
  error       // Error si ocurre
} = useRolesList()
```

### 5. **Integración con Módulo de Users**

El hook `use-roles.ts` en el módulo de users ahora re-exporta el hook del módulo de roles:

```typescript
// src/modules/users/hooks/use-roles.ts
export { useRolesList as useRoles } from "@/modules/roles"
```

Esto permite que el módulo de users use el servicio centralizado de roles sin duplicar código.

### 6. **Corrección de Bug**

Se corrigió un error en `users-table.tsx` donde `getUserInitials` podía fallar con valores `undefined`:

```typescript
const getUserInitials = (email: string, memberName?: string | null) => {
  if (memberName && memberName.length > 0) {
    return memberName.substring(0, 2).toUpperCase()
  }
  if (email && email.length > 0) {
    return email.substring(0, 2).toUpperCase()
  }
  return "US" // Fallback por defecto
}
```

## 🚀 Uso

### Obtener todos los roles

```typescript
import { useRolesList } from "@/modules/roles"

function MyComponent() {
  const { roles, isLoading } = useRolesList()
  
  return (
    <select>
      {roles.map(role => (
        <option key={role.id} value={role.id}>
          {role.name}
        </option>
      ))}
    </select>
  )
}
```

### Gestión completa de roles

```typescript
import { useRoles } from "@/modules/roles"

function RolesManagement() {
  const { roles, stats, createRole, updateRole, deleteRole } = useRoles()
  
  // Crear rol
  const handleCreate = async () => {
    await createRole({
      name: "editor",
      permissions: ["1", "2", "3"]
    })
  }
  
  // Actualizar rol
  const handleUpdate = async (roleId: string) => {
    await updateRole(roleId, {
      name: "editor-updated"
    })
  }
  
  // Eliminar rol
  const handleDelete = async (roleId: string) => {
    await deleteRole(roleId)
  }
  
  return (
    <>
      <div>Total de roles: {stats?.total_roles}</div>
      {/* ... */}
    </>
  )
}
```

### Obtener permisos de un rol

```typescript
import { useRoles } from "@/modules/roles"

function RolePermissions({ roleId }: { roleId: string }) {
  const { getRolePermissions } = useRoles()
  const [permissions, setPermissions] = useState<Permission[]>([])
  
  useEffect(() => {
    const loadPermissions = async () => {
      const perms = await getRolePermissions(roleId)
      setPermissions(perms)
    }
    loadPermissions()
  }, [roleId])
  
  return (
    <ul>
      {permissions.map(perm => (
        <li key={perm.id}>
          {perm.resource} - {perm.action}
        </li>
      ))}
    </ul>
  )
}
```

### Usar servicio directamente

```typescript
import { rolesService } from "@/modules/roles"

// Obtener todos los roles
const roles = await rolesService.getAllRoles()

// Obtener rol específico
const role = await rolesService.getRoleById("1")

// Obtener permisos de un rol
const permissions = await rolesService.getRolePermissions("1")

// Obtener estadísticas
const stats = await rolesService.getStats()

// Crear rol
const newRole = await rolesService.createRole({
  name: "moderator",
  permissions: ["5", "6", "7"]
})
```

## 📊 Estadísticas

El endpoint de estadísticas retorna información útil del sistema:

```typescript
{
  total_roles: 5,                    // Total de roles en el sistema
  total_permissions: 20,             // Total de permisos disponibles
  roles_with_permissions: 4,         // Roles que tienen permisos asignados
  roles_without_permissions: 1       // Roles sin permisos
}
```

## 🔐 Permisos Necesarios

Para acceder al módulo de roles, el usuario debe tener los permisos adecuados:
- **Leer roles**: `roles:read`
- **Crear roles**: `roles:create`
- **Actualizar roles**: `roles:update`
- **Eliminar roles**: `roles:delete`

## 📝 Estructura de Datos de la API

### Rol con Permisos (GET /auth/roles)
```json
{
  "status": 200,
  "message": "Roles obtenidos exitosamente",
  "data": [
    {
      "id": "1",
      "name": "admin",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "permissions": [
        {
          "id": "1",
          "resource": "users",
          "action": "create",
          "type": 0,
          "created_at": "2024-01-01T00:00:00.000Z",
          "updated_at": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

## ✅ Estado

**Integración Completa** ✓

- ✅ Endpoints configurados correctamente en `enpoints.ts`
- ✅ Types actualizados según la API
- ✅ Service implementado con todos los endpoints
- ✅ Hooks personalizados creados
- ✅ Integración con módulo de users
- ✅ Bug de `getUserInitials` corregido
- ✅ Sin errores de compilación

---

*Fecha de integración: Diciembre 2025*

