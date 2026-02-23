import { useState, useMemo } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Plus, Loader2, Users, CheckCircle2, XCircle, Key } from "lucide-react"
import { CreateUserDialog } from "../components/create-user-dialog"
import { EditUserDialog } from "../components/edit-user-dialog"
import { UsersTable } from "../components/users-table"
import { useUsers } from "../hooks/use-users"
import { useRoles } from "../hooks/use-roles"
import type { User, CreateUserRequest, UpdateUserRequest } from "../types"

export function UsersPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Crear filtros con useMemo
  const filters = useMemo(
    () => ({
      search: searchQuery || undefined,
      page: currentPage,
      pageSize,
    }),
    [searchQuery, currentPage, pageSize]
  )

  const { users, stats, pagination, isLoading, createUser, updateUser, deleteUser } = useUsers(filters)
  const { roles, isLoading: rolesLoading } = useRoles()

  // Manejar cambio en la búsqueda
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // Resetear a la página 1 al buscar
    setCurrentPage(1)
  }

  const handleCreateUser = async (data: CreateUserRequest) => {
    try {
      await createUser(data)
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error("Error al crear usuario:", error)
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleUpdateUser = async (data: UpdateUserRequest) => {
    if (!selectedUser) return

    try {
      await updateUser(selectedUser.id, data)
      setIsEditModalOpen(false)
      setSelectedUser(null)
    } catch (error) {
      console.error("Error al actualizar usuario:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId)
    } catch (error) {
      console.error("Error al eliminar usuario:", error)
    }
  }

  const handleViewMember = (memberId: string) => {
    navigate(`/admin/members/${memberId}`)
  }

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Gestiona los usuarios del sistema</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
              <p className="text-xs text-muted-foreground">{stats.total_roles} roles distintos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email Verificado</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verified_users}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total_users > 0
                  ? ((stats.verified_users / stats.total_users) * 100).toFixed(1)
                  : 0}
                % del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sin Verificar</CardTitle>
              <XCircle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unverified_users}</div>
              <p className="text-xs text-muted-foreground">Pendientes de verificación</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Con Contraseña</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.password_users}</div>
              <p className="text-xs text-muted-foreground">{stats.google_users} con Google</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabla de Usuarios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>
                {pagination.count} usuario{pagination.count !== 1 ? "s" : ""} registrado
                {pagination.count !== 1 ? "s" : ""} en el sistema
              </CardDescription>
            </div>
            {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </div>
        </CardHeader>
        <CardContent>
          <UsersTable
            users={users}
            onSearch={handleSearch}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
            onViewMember={handleViewMember}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Modales */}
      <CreateUserDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateUser}
        roles={roles}
        rolesLoading={rolesLoading}
      />

      <EditUserDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        user={selectedUser}
        onSubmit={handleUpdateUser}
        roles={roles}
        rolesLoading={rolesLoading}
      />
    </div>
  )
}
