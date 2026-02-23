# Integración del Módulo de Usuarios con el Backend

## 📋 Resumen

El módulo de usuarios ha sido completamente integrado con el backend de la API. Todos los componentes, servicios y hooks han sido actualizados para consumir los endpoints reales.

## 🔄 Cambios Implementados

### 1. **Types** (`src/modules/users/types/index.ts`)

Se actualizaron todos los tipos para que coincidan con la API del backend:

- `User`: Incluye todos los campos que retorna la API (id, email, role_id, role_name, member data, teams counts, etc.)
- `CreateUserRequest`: Datos para crear un usuario
- `UpdateUserRequest`: Datos para actualizar un usuario
- `UserStats`: Estadísticas generales del sistema
- `UserDetailedStats`: Estadísticas específicas de un usuario
- `UserFilters`: Filtros para búsqueda de usuarios
- `PaginatedResponse<T>`: Respuesta paginada genérica
- `ApiResponse<T>`: Estructura de respuesta de la API
- `Role`: Tipo para roles disponibles

### 2. **Service** (`src/modules/users/services/users.service.ts`)

Implementación completa de todos los endpoints de la API:

#### Endpoints Implementados:

```typescript
// Obtener usuarios con filtros
getUsers(filters?: UserFilters): Promise<User | PaginatedResponse<User>>

// Obtener usuario por ID
getUserById(id: string): Promise<User>

// Crear usuario
createUser(data: CreateUserRequest): Promise<User>

// Actualizar usuario
updateUser(id: string, data: UpdateUserRequest): Promise<User>

// Eliminar usuario
deleteUser(id: string): Promise<void>

// Obtener estadísticas generales
getStats(): Promise<UserStats>

// Obtener estadísticas de un usuario específico
getUserStats(idOrEmail: string): Promise<UserDetailedStats>
```

#### Filtros Soportados:
- `id`: Filtrar por ID específico
- `email`: Filtrar por email específico
- `role_id`: Filtrar por rol
- `has_member`: Usuarios con/sin miembro asociado
- `search`: Búsqueda por email o nombre de miembro
- `page`: Número de página (paginación)
- `pageSize`: Tamaño de página (paginación)

### 3. **Hooks Personalizados**

#### `useUsers` (`src/modules/users/hooks/use-users.ts`)
Hook principal para manejar la lógica de usuarios:
- Carga automática de usuarios con filtros
- Carga de estadísticas
- Manejo de paginación
- Estados de carga y error
- Funciones para CRUD completo
- Actualización automática después de operaciones

**Retorna:**
```typescript
{
  users: User[]
  stats: UserStats | null
  pagination: { currentPage, totalPages, count }
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  createUser: (data: CreateUserRequest) => Promise<void>
  updateUser: (id: string, data: UpdateUserRequest) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}
```

#### `useRoles` (`src/modules/users/hooks/use-roles.ts`)
Hook para obtener los roles disponibles desde la API:
- Carga automática de roles
- Estados de carga y error
- Fallback en caso de error

**Retorna:**
```typescript
{
  roles: Role[]
  isLoading: boolean
  error: Error | null
}
```

### 4. **Componentes Actualizados**

#### `UsersPage` (`src/modules/users/pages/users-page.tsx`)
- Integración completa con `useUsers` y `useRoles`
- Tarjetas de estadísticas (total usuarios, verificados, sin verificar, con contraseña)
- Manejo de estados de carga
- Búsqueda y paginación
- Modales para crear y editar usuarios

#### `CreateUserDialog` (`src/modules/users/components/create-user-dialog.tsx`)
- Formulario para crear usuarios
- Campos: email (requerido), password (requerido), role_id (opcional), image (opcional)
- Validación de campos requeridos
- Estado de carga durante el submit
- Carga dinámica de roles desde la API
- Reseteo automático del formulario después de crear

#### `EditUserDialog` (`src/modules/users/components/edit-user-dialog.tsx`)
- Formulario para editar usuarios
- Campos: email, password (opcional para cambiar), role_id, image
- Muestra información del miembro asociado (si existe)
- Muestra estadísticas del usuario (equipos creados, equipos miembro)
- Estado de carga durante el submit
- Carga dinámica de roles desde la API

#### `UsersTable` (`src/modules/users/components/users-table.tsx`)
- Tabla mejorada con información completa de cada usuario
- Avatar del usuario (imagen o iniciales)
- Badge de Google si el usuario se autenticó con Google
- Estado de verificación de email (CheckCircle/XCircle)
- Información del miembro asociado (nombre, apellido, estado)
- Contador de equipos (creados y pertenencia)
- Fecha de registro formateada
- Confirmación de eliminación con AlertDialog
- Paginación con botones Anterior/Siguiente
- Estado de carga con spinner
- Mensaje cuando no hay resultados

### 5. **Características de la Integración**

#### ✅ **Manejo de Errores**
- Todos los errores son capturados y mostrados mediante toasts (sonner)
- Los interceptores de Axios manejan automáticamente:
  - 401: Redirige al login
  - 403: Muestra mensaje de permisos
  - 404: Recurso no encontrado
  - 422: Error de validación
  - 500: Error del servidor

#### ✅ **Feedback al Usuario**
- Toasts de éxito después de crear, editar o eliminar
- Estados de carga durante las operaciones
- Indicadores visuales de carga (Loader2 spinner)
- Confirmación antes de eliminar usuarios

#### ✅ **Paginación**
- Soporte completo de paginación servidor-side
- Información de página actual, total de páginas y total de registros
- Botones de navegación (Anterior/Siguiente)
- Deshabilitación automática en los límites

#### ✅ **Búsqueda**
- Búsqueda en tiempo real
- Búsqueda por email o nombre de miembro
- Manejo en el backend (parámetro `search`)

#### ✅ **Estadísticas**
- Dashboard con tarjetas de estadísticas:
  - Total de usuarios
  - Usuarios con email verificado
  - Usuarios sin verificar
  - Usuarios con contraseña vs Google
  - Total de roles distintos

## 🚀 Uso

### Obtener todos los usuarios (paginados)
```typescript
const { users, pagination, isLoading } = useUsers({
  page: 1,
  pageSize: 20
})
```

### Buscar usuarios
```typescript
const { users } = useUsers({
  search: "juan",
  page: 1,
  pageSize: 20
})
```

### Filtrar por rol
```typescript
const { users } = useUsers({
  role_id: "1",
  page: 1,
  pageSize: 20
})
```

### Crear un usuario
```typescript
const { createUser } = useUsers()

await createUser({
  email: "nuevo@ejemplo.com",
  password: "password123",
  role_id: "2"
})
```

### Actualizar un usuario
```typescript
const { updateUser } = useUsers()

await updateUser("user-id", {
  email: "actualizado@ejemplo.com",
  role_id: "3"
})
```

### Eliminar un usuario
```typescript
const { deleteUser } = useUsers()

await deleteUser("user-id")
```

## 📊 Estadísticas

### Estadísticas Generales
```typescript
const { stats } = useUsers()

// stats contiene:
// - total_users
// - verified_users
// - unverified_users
// - google_users
// - password_users
// - total_roles
```

### Estadísticas de Usuario Específico
```typescript
const userStats = await usersService.getUserStats("user-id")
// o
const userStats = await usersService.getUserStats("usuario@ejemplo.com")

// userStats contiene:
// - work_teams_created
// - team_memberships
```

## 🔐 Permisos Necesarios

Para acceder al módulo de usuarios, el usuario debe tener el permiso:
- **Recurso**: `users`
- **Acción**: `read`

Las operaciones adicionales requieren:
- **Crear**: `users:create`
- **Actualizar**: `users:update`
- **Eliminar**: `users:delete`

## 📝 Notas Adicionales

1. **Axios Config**: Se exportó `axiosInstance` como named export y default export para mayor flexibilidad.

2. **Roles**: Los roles se cargan dinámicamente desde el endpoint `/roles` de la API.

3. **Miembros**: La tabla muestra información del miembro asociado si existe.

4. **Soft Delete**: La eliminación de usuarios es un soft delete en el backend.

5. **Validación**: El backend valida todos los campos según la documentación Swagger.

6. **Token**: El token de autenticación se agrega automáticamente a todas las peticiones mediante interceptores de Axios.

## ✅ Estado

**Integración Completa** ✓

Todos los endpoints, componentes y funcionalidades han sido implementados y probados. El proyecto compila exitosamente sin errores.

---

*Fecha de integración: Diciembre 2025*

