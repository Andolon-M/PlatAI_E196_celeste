# Sistema de Roles y Permisos

Este módulo implementa un sistema completo de gestión de roles y permisos para la aplicación SIGA-IVEAD.

## Arquitectura

El sistema sigue el patrón de arquitectura hexagonal (Clean Architecture) ya establecido en el proyecto:

```
src/modules/auth/
├── application/
│   ├── controllers/roles-permissions.controller.ts    # Controladores HTTP
│   ├── services/roles-permissions.service.ts          # Lógica de negocio
│   └── validators/roles-permissions.validator.ts      # Validaciones
├── infrastructure/
│   └── repositories/roles-permissions.repository.ts   # Acceso a datos
├── routers/
│   ├── roles-permissions.routes.ts                    # Definición de rutas
│   └── roles-permissions.routers.swagger.ts          # Documentación Swagger
└── README-roles-permissions.md                        # Esta documentación
```

## Características Principales

### ✅ Consultas Optimizadas
- **SQL Nativo**: Uso de consultas SQL nativas para mejor rendimiento
- **Transacciones**: Operaciones críticas protegidas con transacciones
- **Sin Include**: Evita el uso excesivo de `include` de Prisma para mejor performance

### ✅ Funcionalidades Completas
- **CRUD de Roles**: Crear, leer, actualizar y eliminar roles
- **CRUD de Permisos**: Crear, leer, actualizar y eliminar permisos
- **Asignación de Permisos**: Asignar múltiples permisos a roles
- **Gestión de Relaciones**: Eliminar permisos específicos de roles
- **Estadísticas**: Métricas del sistema de roles y permisos

## Endpoints Disponibles

### Roles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/roles` | Crear un nuevo rol |
| `GET` | `/api/auth/roles` | Obtener todos los roles con permisos |
| `GET` | `/api/auth/roles/:id` | Obtener un rol específico con permisos |
| `PUT` | `/api/auth/roles/:id` | Actualizar un rol |
| `DELETE` | `/api/auth/roles/:id` | Eliminar un rol |

### Permisos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/permissions` | Crear un nuevo permiso |
| `GET` | `/api/auth/permissions` | Obtener todos los permisos |
| `GET` | `/api/auth/permissions/:id` | Obtener un permiso específico |
| `PUT` | `/api/auth/permissions/:id` | Actualizar un permiso |
| `DELETE` | `/api/auth/permissions/:id` | Eliminar un permiso |

### Asignación de Permisos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/auth/roles/:id/permissions` | Asignar permisos a un rol |
| `GET` | `/api/auth/roles/:id/permissions` | Obtener permisos de un rol |
| `DELETE` | `/api/auth/roles/:roleId/permissions/:permissionId` | Eliminar permiso de un rol |

### Utilidades

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/auth/roles-permissions/stats` | Obtener estadísticas del sistema |

## Ejemplos de Uso

### 1. Crear un Rol

```bash
POST /api/auth/roles
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "admin",
  "guard_name": "web"
}
```

**Respuesta:**
```json
{
  "status": 201,
  "message": "Rol creado exitosamente",
  "data": {
    "role": {
      "id": 1,
      "name": "admin",
      "guard_name": "web",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "permissions": []
    }
  }
}
```

### 2. Crear Permisos

```bash
POST /api/auth/permissions
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "create-users",
  "guard_name": "web"
}
```

### 3. Asignar Permisos a un Rol

```bash
POST /api/auth/roles/1/permissions
Content-Type: application/json
Authorization: Bearer <token>

{
  "permission_ids": [1, 2, 3]
}
```

### 4. Obtener Roles con Permisos

```bash
GET /api/auth/roles
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "status": 200,
  "message": "Roles obtenidos exitosamente",
  "data": {
    "roles": [
      {
        "id": 1,
        "name": "admin",
        "guard_name": "web",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
        "permissions": [
          {
            "id": 1,
            "name": "create-users",
            "guard_name": "web",
            "created_at": "2024-01-15T10:35:00Z",
            "updated_at": "2024-01-15T10:35:00Z"
          }
        ]
      }
    ],
    "total": 1
  }
}
```

## Validaciones

### Roles
- **Nombre**: Requerido, máximo 255 caracteres, único por guard
- **Guard Name**: Opcional, por defecto 'web', máximo 255 caracteres

### Permisos
- **Nombre**: Requerido, máximo 255 caracteres, único por guard
- **Guard Name**: Opcional, por defecto 'web', máximo 255 caracteres

### Asignación de Permisos
- **Permission IDs**: Array de números enteros válidos
- **Validación de Existencia**: Verifica que todos los permisos existan

## Seguridad

- **Autenticación Requerida**: Todas las rutas requieren token JWT válido
- **Validación de Entrada**: Sanitización y validación de todos los datos
- **Transacciones**: Operaciones críticas protegidas con transacciones de base de datos
- **Soft Delete**: Eliminación lógica para mantener integridad referencial

## Optimizaciones de Rendimiento

### Consultas SQL Nativas
```sql
-- Ejemplo de consulta optimizada para obtener roles con permisos
SELECT 
  r.id,
  r.name,
  r.guard_name,
  r.created_at,
  r.updated_at,
  GROUP_CONCAT(
    CONCAT(
      '{"id":', p.id, 
      ',"name":"', p.name, 
      '","guard_name":"', p.guard_name, 
      '","created_at":"', p.created_at, 
      '","updated_at":"', p.updated_at, '"}'
    ) SEPARATOR ','
  ) as permissions_json
FROM roles r
LEFT JOIN role_has_permissions rhp ON r.id = rhp.role_id
LEFT JOIN permissions p ON rhp.permission_id = p.id
WHERE r.deleted_at IS NULL
GROUP BY r.id, r.name, r.guard_name, r.created_at, r.updated_at
ORDER BY r.name
```

### Transacciones
```typescript
// Ejemplo de uso de transacciones para asignación de permisos
static async assignPermissionsToRole(roleId: bigint, permissionIds: bigint[]) {
  return await prisma.$transaction(async (tx) => {
    // Eliminar asignaciones existentes
    await tx.role_has_permissions.deleteMany({
      where: { role_id: roleId }
    });

    // Crear nuevas asignaciones
    if (permissionIds.length > 0) {
      const assignments = permissionIds.map(permissionId => ({
        role_id: roleId,
        permission_id: permissionId
      }));

      await tx.role_has_permissions.createMany({
        data: assignments
      });
    }

    return { success: true, assignedPermissions: permissionIds.length };
  });
}
```

## Manejo de Errores

El sistema maneja errores de forma consistente:

```json
{
  "status": 400,
  "message": "Error al crear rol",
  "data": {
    "error": "Ya existe un rol con el nombre 'admin'"
  }
}
```

### Códigos de Estado HTTP
- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Error de validación o datos inválidos
- **404**: Recurso no encontrado
- **500**: Error interno del servidor

## Documentación Swagger

La documentación completa está disponible en Swagger UI:
- **URL**: `/api-docs` (cuando esté configurado)
- **Archivo**: `src/modules/auth/routers/roles-permissions.routers.swagger.ts`

## Próximos Pasos

1. **Integración con Usuarios**: Asignar roles a usuarios
2. **Middleware de Autorización**: Verificar permisos en rutas protegidas
3. **Auditoría**: Log de cambios en roles y permisos
4. **Cache**: Implementar cache para consultas frecuentes
5. **Bulk Operations**: Operaciones masivas para roles y permisos

## Consideraciones de Base de Datos

### Estructura de Tablas
- **roles**: Almacena los roles del sistema
- **permissions**: Almacena los permisos disponibles
- **role_has_permissions**: Tabla de relación muchos a muchos

### Índices Recomendados
```sql
-- Índices para optimizar consultas
CREATE INDEX idx_roles_name_guard ON roles(name, guard_name);
CREATE INDEX idx_permissions_name_guard ON permissions(name, guard_name);
CREATE INDEX idx_role_permissions_role ON role_has_permissions(role_id);
CREATE INDEX idx_role_permissions_permission ON role_has_permissions(permission_id);
```

### Soft Delete
- Todos los registros usan `deleted_at` para eliminación lógica
- Las consultas filtran automáticamente registros eliminados
- Mantiene integridad referencial en relaciones existentes
