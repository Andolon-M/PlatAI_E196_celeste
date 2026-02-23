# API Configuration

Este directorio contiene la configuración de Axios y los endpoints de la API.

## Estructura

- `axios.config.ts`: Configuración de Axios con interceptores
- `enpoints.ts`: Definición de todos los endpoints de la API
- `index.ts`: Exportaciones principales

## Uso

### Importar Axios configurado

```typescript
import { axiosInstance, API_ENDPOINTS, type ApiResponse } from "@/shared/api"
```

### Hacer una petición GET

```typescript
const response = await axiosInstance.get<ApiResponse<User[]>>(
  API_ENDPOINTS.USERS.LIST
)
const users = response.data.data
```

### Hacer una petición POST

```typescript
const newUser = { name: "Juan", email: "juan@example.com" }
const response = await axiosInstance.post<ApiResponse<User>>(
  API_ENDPOINTS.USERS.CREATE,
  newUser
)
const user = response.data.data
```

### Hacer una petición PUT/PATCH

```typescript
const updatedData = { name: "Juan Pérez" }
const response = await axiosInstance.put<ApiResponse<User>>(
  API_ENDPOINTS.USERS.UPDATE(userId),
  updatedData
)
const user = response.data.data
```

### Hacer una petición DELETE

```typescript
await axiosInstance.delete(API_ENDPOINTS.USERS.DELETE(userId))
```

## Interceptores

### Request Interceptor

Automáticamente agrega el token de autenticación a todas las peticiones:

```typescript
Authorization: Bearer {token}
```

### Response Interceptor

- **Éxito (2xx)**: Muestra un toast con el mensaje del backend (excepto en peticiones GET)
- **Error (4xx/5xx)**: Muestra un toast de error con el mensaje del backend

#### Códigos de error manejados:

- **400 Bad Request**: Error de validación
- **401 Unauthorized**: Sesión expirada, redirige al login
- **403 Forbidden**: Sin permisos
- **404 Not Found**: Recurso no encontrado
- **422 Unprocessable Entity**: Error de validación
- **500 Internal Server Error**: Error del servidor

## Estructura de Respuesta del Backend

```typescript
interface ApiResponse<T = any> {
  status: number
  message: string
  data: T
}
```

## Variables de Entorno

Asegúrate de tener configurada la variable de entorno:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Ejemplo Completo en un Servicio

```typescript
import { axiosInstance, API_ENDPOINTS, type ApiResponse } from "@/shared/api"
import type { User } from "../types"

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await axiosInstance.get<ApiResponse<User[]>>(
      API_ENDPOINTS.USERS.LIST
    )
    return response.data.data
  },

  async create(data: Partial<User>): Promise<User> {
    const response = await axiosInstance.post<ApiResponse<User>>(
      API_ENDPOINTS.USERS.CREATE,
      data
    )
    return response.data.data
  },

  async update(id: number, data: Partial<User>): Promise<User> {
    const response = await axiosInstance.put<ApiResponse<User>>(
      API_ENDPOINTS.USERS.UPDATE(id),
      data
    )
    return response.data.data
  },

  async delete(id: number): Promise<void> {
    await axiosInstance.delete(API_ENDPOINTS.USERS.DELETE(id))
  },
}
```

## Manejo de Errores

Los errores se manejan automáticamente mediante los interceptores. No necesitas manejar los toasts manualmente:

```typescript
try {
  const user = await userService.create(data)
  // ✅ Toast de éxito se muestra automáticamente
  navigate("/users")
} catch (error) {
  // ❌ Toast de error se muestra automáticamente
  console.error("Error:", error)
}
```

## Notas Importantes

1. **Tokens**: El token se guarda automáticamente en `localStorage` después del login
2. **Mensajes**: Los mensajes provienen del backend en `response.data.message`
3. **Redirección**: En caso de error 401, se redirige automáticamente a `/login`
4. **Timeout**: Las peticiones tienen un timeout de 30 segundos

