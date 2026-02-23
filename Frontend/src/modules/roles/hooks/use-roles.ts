import { useState, useEffect, useCallback } from "react"
import { rolesService } from "../services/roles.service"
import type { Role, Permission, RolesStats, CreateRoleData, UpdateRoleData } from "../types"

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [stats, setStats] = useState<RolesStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const rolesData = await rolesService.getAllRoles()
      setRoles(rolesData)
    } catch (err) {
      setError(err as Error)
      console.error("Error al obtener roles:", err)
      setRoles([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await rolesService.getStats()
      setStats(statsData)
    } catch (err) {
      console.error("Error al obtener estadísticas de roles:", err)
    }
  }, [])

  const createRole = useCallback(
    async (data: CreateRoleData) => {
      try {
        await rolesService.createRole(data)
        await fetchRoles()
        await fetchStats()
      } catch (err) {
        console.error("Error al crear rol:", err)
        throw err
      }
    },
    [fetchRoles, fetchStats]
  )

  const updateRole = useCallback(
    async (id: string, data: UpdateRoleData) => {
      try {
        await rolesService.updateRole(id, data)
        await fetchRoles()
      } catch (err) {
        console.error("Error al actualizar rol:", err)
        throw err
      }
    },
    [fetchRoles]
  )

  const deleteRole = useCallback(
    async (id: string) => {
      try {
        await rolesService.deleteRole(id)
        await fetchRoles()
        await fetchStats()
      } catch (err) {
        console.error("Error al eliminar rol:", err)
        throw err
      }
    },
    [fetchRoles, fetchStats]
  )

  const getRolePermissions = useCallback(async (roleId: string): Promise<Permission[]> => {
    try {
      return await rolesService.getRolePermissions(roleId)
    } catch (err) {
      console.error("Error al obtener permisos del rol:", err)
      throw err
    }
  }, [])

  useEffect(() => {
    fetchRoles()
    fetchStats()
  }, [fetchRoles, fetchStats])

  return {
    roles,
    stats,
    isLoading,
    error,
    refetch: fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    getRolePermissions,
  }
}

/**
 * Hook simplificado para solo obtener la lista de roles
 * Útil para selects y dropdowns
 */
export function useRolesList() {
  const [roles, setRoles] = useState<Role[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const rolesData = await rolesService.getAllRoles()
        setRoles(rolesData)
      } catch (err) {
        setError(err as Error)
        console.error("Error al obtener roles:", err)
        setRoles([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoles()
  }, [])

  return {
    roles,
    isLoading,
    error,
  }
}

