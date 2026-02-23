import axios, { AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from "axios"
import { toast } from "sonner"

// Interfaz para la respuesta del backend
interface ApiResponse<T = any> {
  status: number
  message: string
  data: T
}

// Crear instancia de Axios
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Interceptor de Request - Agregar token de autenticación
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("token")
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Interceptor de Response - Manejar respuestas y errores
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // Si la respuesta tiene un mensaje de éxito, mostrarlo
    if (response.data?.message) {
      // Solo mostrar toast en operaciones POST, PUT, DELETE (no en GET)
      const method = response.config.method?.toUpperCase()
      if (method !== "GET") {
        toast.success(response.data.message, {
          duration: 3000,
        })
      }
    }
    
    return response
  },
  (error: AxiosError<ApiResponse>) => {
    // Manejar diferentes tipos de errores
    if (error.response) {
      // El servidor respondió con un código de error
      const { status, data } = error.response
      const message = data?.message || "Ha ocurrido un error"
      
      switch (status) {
        case 400:
          // Bad Request
          toast.error(message, {
            duration: 4000,
          })
          break
          
        case 401:
          // No autorizado - Redirigir al login
          toast.error(message || "Sesión expirada. Por favor, inicia sesión nuevamente.", {
            duration: 4000,
          })
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          // Redirigir al login después de un breve delay
          setTimeout(() => {
            window.location.href = "/login"
          }, 1500)
          break
          
        case 403:
          // Prohibido
          toast.error(message || "No tienes permisos para realizar esta acción", {
            duration: 4000,
          })
          break
          
        case 404:
          // No encontrado
          toast.error(message || "Recurso no encontrado", {
            duration: 3000,
          })
          break
          
        case 422:
          // Error de validación
          toast.error(message || "Error de validación", {
            duration: 4000,
          })
          break
          
        case 500:
          // Error del servidor
          toast.error(message || "Error interno del servidor", {
            duration: 4000,
          })
          break
          
        default:
          // Otros errores
          toast.error(message, {
            duration: 4000,
          })
      }
    } else if (error.request) {
      // La petición fue hecha pero no hubo respuesta
      toast.error("No se pudo conectar con el servidor. Verifica tu conexión a internet.", {
        duration: 5000,
      })
    } else {
      // Error al configurar la petición
      toast.error("Error al procesar la solicitud", {
        duration: 3000,
      })
    }
    
    return Promise.reject(error)
  }
)

export { axiosInstance }
export default axiosInstance
export type { ApiResponse }

