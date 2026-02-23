# AuthContext - Sistema de Autenticación

## 📋 Resumen

El **AuthContext** maneja toda la autenticación, permisos y roles del usuario en la aplicación. Proporciona:

- ✅ Autenticación con JWT
- ✅ Gestión de sesión de usuario
- ✅ Verificación de permisos
- ✅ Verificación de roles
- ✅ Rutas protegidas
- ✅ Componentes condicionales por permisos

## 🚀 Estructura del Usuario

### Respuesta del Endpoint `/auth/me`

```json
{
  "status": 200,
  "message": "Información del usuario obtenida correctamente",
  "data": {
    "userId": "1",
    "email": "admin@ejemplo.com",
    "role": {
      "id": "1",
      "name": "Super Admin"
    },
    "permissions": [
      {
        "id": "1",
        "resource": "users",
        "action": "create",
        "type": 0
      },
      {
        "id": "2",
        "resource": "users",
        "action": "read",
        "type": 0
      }
      // ... más permisos
    ]
  }
}
```

### Tipos TypeScript

```typescript
interface User {
  userId: string
  email: string
  role: Role
  permissions: Permission[]
}

interface Role {
  id: string
  name: string
}

interface Permission {
  id: string
  resource: string
  action: "create" | "read" | "update" | "delete"
  type: number
}
```

## 💻 Uso del Hook `useAuth`

### Importar el Hook

```typescript
import { useAuth } from "@/shared/contexts/auth-context"
```

### Propiedades Disponibles

```typescript
const {
  user,              // Usuario actual o null
  isLoading,         // true mientras carga la sesión
  isAuthenticated,   // true si hay usuario logueado
  login,             // Función para iniciar sesión
  logout,            // Función para cerrar sesión
  refreshUser,       // Recargar datos del usuario
  hasPermission,     // Verificar un permiso
  hasAnyPermission,  // Verificar múltiples permisos
  hasRole,           // Verificar rol
} = useAuth()
```

### Ejemplo Completo

```typescript
function MyComponent() {
  const { user, isAuthenticated, hasPermission, logout } = useAuth()

  if (!isAuthenticated) {
    return <div>No autorizado</div>
  }

  return (
    <div>
      <h1>Bienvenido {user?.email}</h1>
      <p>Rol: {user?.role.name}</p>
      
      {hasPermission('users', 'create') && (
        <button>Crear Usuario</button>
      )}
      
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  )
}
```

## 🔐 Verificación de Permisos

### 1. Usando el Hook `useAuth`

```typescript
import { useAuth } from "@/shared/contexts/auth-context"

function UsersPage() {
  const { hasPermission } = useAuth()

  return (
    <div>
      {hasPermission('users', 'create') && (
        <button>Crear Usuario</button>
      )}
      
      {hasPermission('users', 'delete') && (
        <button>Eliminar Usuario</button>
      )}
    </div>
  )
}
```

### 2. Usando el Hook `usePermission`

```typescript
import { usePermission } from "@/shared/hooks/use-permission"

function EventsPage() {
  const { can, canAny, isRole } = usePermission()

  return (
    <div>
      {/* Verificar permiso específico */}
      {can('events', 'create') && (
        <button>Crear Evento</button>
      )}
      
      {/* Verificar múltiples permisos (OR) */}
      {canAny([
        { resource: 'events', action: 'update' },
        { resource: 'events', action: 'delete' }
      ]) && (
        <button>Gestionar Eventos</button>
      )}
      
      {/* Verificar rol */}
      {isRole('Super Admin') && (
        <button>Configuración Avanzada</button>
      )}
    </div>
  )
}
```

### 3. Usando Componentes `<Can>`

```typescript
import { Can, CanAny, HasRole } from "@/shared/components/can"

function Dashboard() {
  return (
    <div>
      {/* Mostrar solo si tiene permiso */}
      <Can resource="users" action="create">
        <button>Crear Usuario</button>
      </Can>
      
      {/* Con fallback */}
      <Can 
        resource="users" 
        action="read" 
        fallback={<p>No tienes acceso</p>}
      >
        <UsersTable />
      </Can>
      
      {/* Múltiples permisos */}
      <CanAny permissions={[
        { resource: 'users', action: 'update' },
        { resource: 'users', action: 'delete' }
      ]}>
        <button>Gestionar Usuarios</button>
      </CanAny>
      
      {/* Por rol */}
      <HasRole role="Super Admin">
        <AdminPanel />
      </HasRole>
    </div>
  )
}
```

## 🛡️ Rutas Protegidas

### Proteger Toda una Sección

```typescript
import { ProtectedRoute } from "@/shared/components/protected-route"

<Route 
  path="/admin" 
  element={
    <ProtectedRoute>
      <AdminLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<Dashboard />} />
  <Route path="users" element={<UsersPage />} />
</Route>
```

### Proteger con Permiso Específico

```typescript
<Route 
  path="/admin/users" 
  element={
    <ProtectedRoute requirePermission={{ resource: 'users', action: 'read' }}>
      <UsersPage />
    </ProtectedRoute>
  }
/>
```

### Proteger con Rol Específico

```typescript
<Route 
  path="/admin/settings" 
  element={
    <ProtectedRoute requireRole="Super Admin">
      <SettingsPage />
    </ProtectedRoute>
  }
/>
```

## 🔄 Flujo de Autenticación

### 1. Login

```typescript
import { useAuth } from "@/shared/contexts/auth-context"
import { authService } from "@/modules/auth/services/auth.service"

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (credentials) => {
    try {
      // 1. Llamar al servicio de login (obtiene token)
      const token = await authService.login(credentials)
      
      // 2. Guardar token y cargar usuario
      await login(token)
      
      // 3. Redirigir
      navigate('/admin')
    } catch (error) {
      console.error(error)
    }
  }
}
```

### 2. Logout

```typescript
function Header() {
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    // Se redirige automáticamente a /login
  }

  return (
    <button onClick={handleLogout}>
      Cerrar Sesión
    </button>
  )
}
```

### 3. Verificar Autenticación al Cargar

```typescript
// El AuthContext automáticamente:
// 1. Lee el token del localStorage al montar
// 2. Llama al endpoint /auth/me
// 3. Carga los datos del usuario
// 4. Si el token es inválido, limpia la sesión
```

## 📦 LocalStorage

El sistema almacena únicamente:

```typescript
localStorage.setItem('token', 'jwt-token-here')
localStorage.setItem('app-theme', 'light' | 'dark')
```

**NO** se almacena información sensible del usuario en localStorage.

## 🎯 Ejemplos Prácticos

### Ejemplo 1: Botón Condicional

```typescript
import { Can } from "@/shared/components/can"

function UsersPage() {
  return (
    <div>
      <h1>Usuarios</h1>
      
      <Can resource="users" action="create">
        <button onClick={handleCreate}>
          Crear Usuario
        </button>
      </Can>
      
      <UsersTable />
    </div>
  )
}
```

### Ejemplo 2: Menú Condicional

```typescript
import { usePermission } from "@/shared/hooks/use-permission"

function Sidebar() {
  const { can } = usePermission()

  const menuItems = [
    { 
      label: 'Usuarios', 
      path: '/admin/users',
      show: can('users', 'read')
    },
    { 
      label: 'Eventos', 
      path: '/admin/events',
      show: can('events', 'read')
    },
    { 
      label: 'Miembros', 
      path: '/admin/members',
      show: can('members', 'read')
    },
  ].filter(item => item.show)

  return (
    <nav>
      {menuItems.map(item => (
        <Link key={item.path} to={item.path}>
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
```

### Ejemplo 3: Tabla con Acciones

```typescript
import { usePermission } from "@/shared/hooks/use-permission"

function UsersTable({ users }) {
  const { can } = usePermission()

  return (
    <table>
      <thead>
        <tr>
          <th>Email</th>
          <th>Rol</th>
          {(can('users', 'update') || can('users', 'delete')) && (
            <th>Acciones</th>
          )}
        </tr>
      </thead>
      <tbody>
        {users.map(user => (
          <tr key={user.id}>
            <td>{user.email}</td>
            <td>{user.role}</td>
            {(can('users', 'update') || can('users', 'delete')) && (
              <td>
                {can('users', 'update') && (
                  <button onClick={() => handleEdit(user)}>
                    Editar
                  </button>
                )}
                {can('users', 'delete') && (
                  <button onClick={() => handleDelete(user)}>
                    Eliminar
                  </button>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### Ejemplo 4: Formulario con Permisos

```typescript
import { usePermission } from "@/shared/hooks/use-permission"

function UserForm({ user, mode }) {
  const { can } = usePermission()
  const isEditMode = mode === 'edit'
  const canEdit = can('users', 'update')
  const canCreate = can('users', 'create')
  
  const canSubmit = isEditMode ? canEdit : canCreate

  return (
    <form>
      <input name="email" disabled={!canSubmit} />
      <input name="role" disabled={!canSubmit} />
      
      {canSubmit && (
        <button type="submit">
          {isEditMode ? 'Actualizar' : 'Crear'}
        </button>
      )}
      
      {!canSubmit && (
        <p className="text-muted-foreground">
          Solo lectura - No tienes permisos para editar
        </p>
      )}
    </form>
  )
}
```

## 🔍 Debugging

### Ver Usuario Actual

```typescript
function DebugUser() {
  const { user, isAuthenticated } = useAuth()

  console.log('Usuario:', user)
  console.log('Autenticado:', isAuthenticated)
  console.log('Permisos:', user?.permissions)

  return null
}
```

### Ver Permisos del Usuario

```typescript
function DebugPermissions() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div>
      <h3>Permisos del Usuario</h3>
      <ul>
        {user.permissions.map(p => (
          <li key={p.id}>
            {p.resource}.{p.action}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## 📝 Recursos Disponibles

Los recursos disponibles en el sistema son:

- `users` - Usuarios
- `members` - Miembros
- `events` - Eventos
- `sessions` - Sesiones de eventos
- `ministries` - Ministerios
- `work_teams` - Equipos de trabajo
- `roles` - Roles
- `permissions` - Permisos

## 🎨 Acciones Disponibles

Las acciones disponibles son:

- `create` - Crear
- `read` - Leer/Ver
- `update` - Actualizar
- `delete` - Eliminar

## ✅ Checklist de Implementación

- [x] AuthContext creado
- [x] Hook useAuth
- [x] Hook usePermission
- [x] Componentes Can, CanAny, HasRole
- [x] ProtectedRoute
- [x] Integración con Login/Register
- [x] Header con menú de usuario
- [x] Logout funcional
- [x] Verificación automática de token
- [x] Documentación completa

## 🚀 Próximos Pasos

1. Actualizar el sidebar para mostrar/ocultar opciones según permisos
2. Agregar permisos a cada página/sección
3. Implementar mensajes de "sin permisos" personalizados
4. Agregar refresh token si es necesario

