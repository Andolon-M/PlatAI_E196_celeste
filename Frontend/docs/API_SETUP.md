# Configuración de API y Backend

## 📋 Resumen

Este proyecto utiliza **Axios** configurado con interceptores para manejar automáticamente:
- ✅ Autenticación con tokens JWT
- ✅ Mensajes de feedback (toasts) automáticos
- ✅ Manejo de errores centralizado
- ✅ Redirección automática en caso de sesión expirada

## 🚀 Inicio Rápido

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 2. Importar la Configuración

```typescript
import { axiosInstance, API_ENDPOINTS } from "@/shared/api"
```

### 3. Hacer Peticiones

```typescript
// GET
const response = await axiosInstance.get(API_ENDPOINTS.USERS.LIST)
const users = response.data.data

// POST
const response = await axiosInstance.post(API_ENDPOINTS.USERS.CREATE, userData)
const newUser = response.data.data

// PUT
const response = await axiosInstance.put(API_ENDPOINTS.USERS.UPDATE(userId), userData)
const updatedUser = response.data.data

// DELETE
await axiosInstance.delete(API_ENDPOINTS.USERS.DELETE(userId))
```

## 📦 Estructura de Respuesta del Backend

Todas las respuestas del backend deben seguir esta estructura:

```typescript
{
  "status": 200,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com"
  }
}
```

## 🔧 Interceptores Configurados

### Request Interceptor

Automáticamente agrega el token de autenticación a cada petición:

```typescript
headers: {
  Authorization: `Bearer ${token}`
}
```

### Response Interceptor

#### Éxito (2xx)
- Muestra un toast de éxito con el mensaje del backend
- Solo en operaciones POST, PUT, PATCH, DELETE (no en GET)

#### Error (4xx/5xx)
Maneja automáticamente los siguientes códigos:

| Código | Descripción | Acción |
|--------|-------------|--------|
| 400 | Bad Request | Toast de error |
| 401 | Unauthorized | Toast + Redirige a `/login` |
| 403 | Forbidden | Toast de error |
| 404 | Not Found | Toast de error |
| 422 | Validation Error | Toast de error |
| 500 | Server Error | Toast de error |

## 💡 Ejemplos de Uso

### Ejemplo 1: Crear un Servicio

```typescript
// src/modules/users/services/users.service.ts
import { axiosInstance, API_ENDPOINTS, type ApiResponse } from "@/shared/api"
import type { User } from "../types"

export const usersService = {
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

### Ejemplo 2: Usar el Servicio en un Componente

```typescript
// src/modules/users/components/create-user-dialog.tsx
import { useState } from "react"
import { usersService } from "../services/users.service"

export function CreateUserDialog() {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSubmit = async (data: UserFormData) => {
    setIsLoading(true)
    
    try {
      await usersService.create(data)
      // ✅ Toast de éxito se muestra automáticamente
      // ✅ Mensaje viene del backend
      onClose()
      refresh()
    } catch (error) {
      // ❌ Toast de error se muestra automáticamente
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // ... resto del componente
}
```

### Ejemplo 3: Hook Personalizado

```typescript
// src/modules/users/hooks/use-users.ts
import { useState, useEffect } from "react"
import { usersService } from "../services/users.service"
import type { User } from "../types"

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const data = await usersService.getAll()
      setUsers(data)
    } catch (error) {
      console.error("Error al cargar usuarios:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    isLoading,
    refresh: fetchUsers,
  }
}
```

## 🎨 Feedback Visual (Toasts)

Los toasts se muestran automáticamente usando **Sonner**:

### Toast de Éxito
```typescript
// Backend responde:
{
  "status": 200,
  "message": "Usuario creado exitosamente"
}

// Se muestra automáticamente:
✅ Usuario creado exitosamente
```

### Toast de Error
```typescript
// Backend responde:
{
  "status": 400,
  "message": "El email ya está registrado"
}

// Se muestra automáticamente:
❌ El email ya está registrado
```

## 🔐 Autenticación

### Login
```typescript
import { authService } from "@/modules/auth/services/auth.service"

const handleLogin = async (credentials: LoginCredentials) => {
  try {
    const { user, token } = await authService.login(credentials)
    // Token se guarda automáticamente en localStorage
    // Se incluye automáticamente en todas las peticiones subsecuentes
    navigate("/admin")
  } catch (error) {
    // Error manejado automáticamente
  }
}
```

### Logout
```typescript
const handleLogout = async () => {
  await authService.logout()
  // Limpia token y datos de usuario
  navigate("/login")
}
```

### Verificar Autenticación
```typescript
const isAuthenticated = authService.isAuthenticated()
const user = authService.getUser()
```

## 📝 Agregar Nuevos Endpoints

1. **Agregar endpoint en `src/shared/api/enpoints.ts`**:

```typescript
export const API_ENDPOINTS = {
  // ... otros endpoints
  
  PRODUCTS: {
    LIST: "/products",
    CREATE: "/products",
    UPDATE: (id: number) => `/products/${id}`,
    DELETE: (id: number) => `/products/${id}`,
    GET: (id: number) => `/products/${id}`,
  },
}
```

2. **Crear servicio**:

```typescript
// src/modules/products/services/products.service.ts
import { axiosInstance, API_ENDPOINTS, type ApiResponse } from "@/shared/api"
import type { Product } from "../types"

export const productsService = {
  async getAll(): Promise<Product[]> {
    const response = await axiosInstance.get<ApiResponse<Product[]>>(
      API_ENDPOINTS.PRODUCTS.LIST
    )
    return response.data.data
  },
  
  // ... otros métodos
}
```

## ⚙️ Configuración Avanzada

### Cambiar Timeout

```typescript
// src/shared/api/axios.config.ts
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000, // 30 segundos (cambiar según necesidad)
})
```

### Agregar Headers Personalizados

```typescript
axiosInstance.interceptors.request.use((config) => {
  config.headers["X-Custom-Header"] = "valor"
  return config
})
```

### Deshabilitar Toasts para una Petición Específica

```typescript
const response = await axiosInstance.get(url, {
  headers: {
    'X-Skip-Toast': 'true' // Implementar lógica en interceptor si es necesario
  }
})
```

## 🐛 Debugging

Para ver las peticiones en la consola:

```typescript
// src/shared/api/axios.config.ts
axiosInstance.interceptors.request.use((config) => {
  console.log('📤 Request:', config.method?.toUpperCase(), config.url)
  console.log('📦 Data:', config.data)
  return config
})

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('❌ Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)
```

## 📚 Recursos

- [Axios Documentation](https://axios-http.com/)
- [Sonner (Toast) Documentation](https://sonner.emilkowal.ski/)
- [React Router Documentation](https://reactrouter.com/)

## ✅ Checklist de Implementación

- [x] Axios instalado y configurado
- [x] Interceptores de request y response
- [x] Manejo automático de errores
- [x] Toasts de feedback
- [x] Autenticación con JWT
- [x] Endpoints centralizados
- [x] Servicios de ejemplo (Auth)
- [x] Documentación completa

