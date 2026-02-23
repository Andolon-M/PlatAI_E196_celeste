# Módulo de Usuarios

Este módulo gestiona la funcionalidad completa de usuarios siguiendo la lógica de negocio definida en el schema de Prisma.

## 🏗️ Arquitectura

El módulo sigue la arquitectura hexagonal con las siguientes capas:

```
src/modules/users/
├── application/
│   ├── controllers/     # Controladores HTTP
│   ├── services/        # Lógica de negocio
│   └── validators/      # Validaciones de entrada
├── infrastructure/
│   └── repositories/    # Acceso a datos
└── routers/             # Rutas y documentación Swagger
```

## 📋 Funcionalidades

### Gestión de Usuarios
- ✅ **Crear usuarios** - Con validaciones completas y hash de contraseña
- ✅ **Listar usuarios** - Con filtros avanzados y paginación
- ✅ **Obtener usuario por ID** - Con información relacionada
- ✅ **Obtener usuario por email** - Búsqueda por email
- ✅ **Actualizar usuarios** - Con validación de email único
- ✅ **Eliminar usuarios** - Soft delete
- ✅ **Buscar usuarios** - Por email o nombre de miembro
- ✅ **Usuarios por rol** - Filtrar por rol específico
- ✅ **Estadísticas** - Métricas generales y detalladas

### Filtros Disponibles
- **Por ID**: Búsqueda directa por ID
- **Por email**: Búsqueda por email
- **Por rol**: Filtrar por role_id
- **Por miembro**: Con/sin miembro asociado
- **Búsqueda**: Por email o nombre de miembro
- **Paginación**: Limit y offset

### Lógica de Negocio

#### Validaciones
- **Email único**: No se pueden crear usuarios con email duplicado
- **Hash de contraseña**: Todas las contraseñas se almacenan con hash bcrypt
- **Seguridad**: Las contraseñas nunca se retornan en las respuestas
- **Email válido**: Validación de formato de email
- **Contraseña segura**: Mínimo 6 caracteres

#### Características
- **Autenticación con Google**: Soporte para google_id
- **Verificación de email**: Campo email_verified_at
- **Roles y permisos**: Relación con tabla de roles
- **Imagen de perfil**: URL de imagen personalizada
- **Soft delete**: Los usuarios eliminados no se borran físicamente

## 🚀 Endpoints

### Usuarios
- `POST /users` - Crear usuario
- `GET /users` - Listar usuarios (con filtros y paginación)
- `GET /users/search` - Buscar usuarios por email/nombre
- `GET /users/stats` - Estadísticas generales
- `GET /users/role/:roleId` - Usuarios por rol
- `GET /users/:id` - Obtener usuario por ID
- `GET /users/:id/stats` - Estadísticas detalladas del usuario
- `GET /users/email/:email` - Obtener usuario por email
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

## 🔐 Seguridad

### Middleware de Autenticación
- **isAuthenticated**: Verifica token JWT válido
- **isAuthorized**: Verifica permisos específicos por recurso/acción

### Autorización por Roles
- Solo usuarios con permisos específicos pueden:
  - Crear usuarios (`create.users`)
  - Leer usuarios (`read.users`)
  - Actualizar usuarios (`update.users`)
  - Eliminar usuarios (`delete.users`)

### Restricciones de Negocio
- **Email único**: No se pueden crear usuarios con email duplicado
- **Contraseñas seguras**: Hash con bcrypt (10 rounds)
- **Protección de datos**: Las contraseñas nunca se retornan
- **Soft delete**: Eliminación lógica, no física

## 📊 Información Relacionada

Cada usuario incluye:
- **Rol**: Nombre del rol asignado
- **Miembro asociado**: Datos del miembro si existe
- **Eventos**: Total de eventos registrados
- **Equipos de trabajo**: Equipos creados y membresías
- **Estadísticas**: Actividad completa del usuario

### Estadísticas Generales
- Total de usuarios
- Usuarios con email verificado
- Usuarios sin email verificado
- Usuarios con cuenta de Google
- Usuarios con contraseña
- Total de roles distintos

### Estadísticas Detalladas por Usuario
- Total de eventos
- Eventos a los que asistió
- Eventos registrados
- Eventos confirmados
- Equipos de trabajo creados
- Equipos a los que pertenece

## 🛠️ Uso

### Crear Usuario
```typescript
POST /users
{
  "email": "usuario@example.com",
  "password": "password123",
  "role_id": "1",
  "image": "https://example.com/image.jpg",
  "email_verified_at": "2024-01-01T00:00:00.000Z"
}
```

### Filtrar Usuarios
```typescript
GET /users?role_id=1&has_member=true&page=1&pageSize=20
```

### Buscar Usuarios
```typescript
GET /users/search?q=Juan
```

### Actualizar Usuario
```typescript
PUT /users/1
{
  "email": "nuevo@example.com",
  "role_id": "2",
  "image": "https://example.com/new-image.jpg"
}
```

### Cambiar Contraseña
```typescript
PUT /users/1
{
  "password": "newpassword123"
}
```

## 📚 Documentación

- **Swagger**: Documentación completa en `/users/routers/users.routers.swagger.ts`
- **Validaciones**: Reglas de negocio en `/application/validators/users.validator.ts`
- **Servicios**: Lógica de negocio en `/application/services/users.service.ts`

## 🔄 Flujo de Datos

1. **Request** → Validadores → Controlador
2. **Controlador** → Servicio → Repositorio
3. **Repositorio** → Base de datos (SQL nativo + Prisma)
4. **Response** ← Servicio ← Controlador

## 🎯 Características Especiales

### Hash de Contraseñas
- **bcrypt**: 10 rounds de salting
- **Automático**: Se aplica en creación y actualización
- **Seguro**: Las contraseñas nunca se retornan

### Búsqueda Avanzada
- **Por email**: Búsqueda parcial en email
- **Por miembro**: Búsqueda en nombre/apellido de miembro asociado
- **Sin distinción**: Case-insensitive

### Integración con Miembros
- **Relación 1:1**: Un usuario puede tener un miembro asociado
- **Información completa**: Se incluyen datos del miembro en las respuestas
- **Filtros**: Puede filtrar usuarios con/sin miembro

## 📈 Estadísticas Disponibles

### Por Usuario
- Total de eventos
- Eventos por estado (asistió, registrado, confirmado)
- Equipos de trabajo creados
- Membresías en equipos

### Generales
- Total de usuarios
- Usuarios verificados/no verificados
- Usuarios con Google/contraseña
- Total de roles

## 🔍 Búsquedas Disponibles

- **Por ID**: Búsqueda directa por ID
- **Por email**: Búsqueda exacta por email
- **Por rol**: Todos los usuarios de un rol
- **Búsqueda general**: Por email o nombre de miembro
- **Con filtros**: Combinación de múltiples filtros

## 🔗 Relaciones

### Con Roles
- Un usuario pertenece a un rol
- Se incluye el nombre del rol en las respuestas

### Con Miembros
- Un usuario puede tener un miembro asociado
- Relación 1:1 a través de user_id en members

### Con Eventos
- Los usuarios pueden registrar asistencia a eventos
- Se cuenta el total de eventos relacionados

### Con Equipos de Trabajo
- Los usuarios pueden crear equipos de trabajo (work_teams)
- Los usuarios pueden ser miembros de equipos (team_members)

## ⚠️ Consideraciones

### Seguridad
- **Nunca exponer contraseñas**: Siempre se excluyen de las respuestas
- **Validar permisos**: Usar middleware de autorización
- **Hash seguro**: bcrypt con 10 rounds mínimo

### Performance
- **Paginación**: Siempre usar paginación para listados grandes
- **SQL nativo**: Queries optimizadas con $queryRaw
- **Índices**: Email único con índice automático

### Mantenimiento
- **Soft delete**: Usar deleted_at en lugar de borrar
- **Auditoría**: Campos created_at y updated_at automáticos
- **Validaciones**: Centralizadas en validators

## 🚧 Próximas Funcionalidades

- [ ] Recuperación de contraseña
- [ ] Verificación de email automática
- [ ] Login con redes sociales (Facebook, etc.)
- [ ] Autenticación de dos factores (2FA)
- [ ] Historial de sesiones
- [ ] Dashboard de usuario
- [ ] Notificaciones por email
- [ ] Exportación de datos (GDPR)

