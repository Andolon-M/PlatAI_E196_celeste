import { useState, useEffect, useCallback } from "react"
import { usersService } from "../services/users.service"
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  PaginatedResponse,
  UserStats,
} from "../types"
import { toast } from "sonner"

export function useUsers(filters?: UserFilters) {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [pagination, setPagination] = useState({
    currentPage: filters?.page || 1,
    totalPages: 1,
    count: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await usersService.getUsers(filters)
      
      // Si es un usuario específico (búsqueda por id o email)
      if (!("data" in response)) {
        setUsers([response])
        setPagination({ currentPage: 1, totalPages: 1, count: 1 })
      } else {
        // Si es una lista paginada
        setUsers(response.data)
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          count: response.total,
        })
      }
    } catch (err) {
      setError(err as Error)
      console.error("Error al obtener usuarios:", err)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await usersService.getStats()
      setStats(statsData)
    } catch (err) {
      console.error("Error al obtener estadísticas:", err)
    }
  }, [])

  const createUser = useCallback(
    async (data: CreateUserRequest) => {
      try {
        await usersService.createUser(data)
        await fetchUsers()
        await fetchStats()
      } catch (err) {
        console.error("Error al crear usuario:", err)
        throw err
      }
    },
    [fetchUsers, fetchStats]
  )

  const updateUser = useCallback(
    async (id: string, data: UpdateUserRequest) => {
      try {
        await usersService.updateUser(id, data)
        await fetchUsers()
      } catch (err) {
        console.error("Error al actualizar usuario:", err)
        throw err
      }
    },
    [fetchUsers]
  )

  const deleteUser = useCallback(
    async (id: string) => {
      try {
        await usersService.deleteUser(id)
        await fetchUsers()
        await fetchStats()
      } catch (err) {
        console.error("Error al eliminar usuario:", err)
        throw err
      }
    },
    [fetchUsers, fetchStats]
  )

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    stats,
    pagination,
    isLoading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  }
}
