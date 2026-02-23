import { Button } from "@/shared/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar"
import { SearchInput } from "@/shared/components/search-input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"
import { Edit, Trash2, Mail, Shield, CheckCircle2, XCircle, User as UserIcon, Loader2, Eye, ExternalLink } from "lucide-react"
import type { User } from "../types"
import { formatDateShort } from "@/shared/lib/date-utils"

interface UsersTableProps {
  users: User[]
  onSearch: (query: string) => void
  onEdit: (user: User) => void
  onDelete: (userId: string) => void
  onViewMember?: (memberId: string) => void
  isLoading?: boolean
  pagination?: {
    currentPage: number
    totalPages: number
    count: number
  }
  onPageChange?: (page: number) => void
}

export function UsersTable({
  users,
  onSearch,
  onEdit,
  onDelete,
  onViewMember,
  isLoading,
  pagination,
  onPageChange,
}: UsersTableProps) {

  const getUserInitials = (email: string, name?: string | null, lastName?: string | null) => {
    // Si tiene nombre y apellido, usar iniciales de ambos
    if (name && lastName) {
      return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    // Si solo tiene nombre
    if (name && name.length > 0) {
      return name.substring(0, 2).toUpperCase()
    }
    // Si solo tiene email
    if (email && email.length > 0) {
      return email.substring(0, 2).toUpperCase()
    }
    return "US" // Fallback por defecto
  }

  return (
    <div className="space-y-4">
      {/* Buscador */}
      <SearchInput
        onSearch={onSearch}
        placeholder="Buscar por email o nombre de miembro..."
        isSearching={isLoading}
      />

      {/* Tabla */}
      <div className="overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0">
        <div className="inline-block min-w-full align-middle">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[250px]">Usuario</TableHead>
                <TableHead className="min-w-[120px]">Rol</TableHead>
                <TableHead className="min-w-[100px]">Verificado</TableHead>
                <TableHead className="min-w-[150px]">Miembro</TableHead>
                <TableHead className="min-w-[120px]">Equipos</TableHead>
                <TableHead className="min-w-[120px]">Registro</TableHead>
                <TableHead className="text-right min-w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-muted-foreground">Cargando usuarios...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    {/* Usuario */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          {user.image && <AvatarImage src={user.image} alt={user.email} />}
                          <AvatarFallback>
                            {getUserInitials(user.email, user.name, user.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium truncate max-w-[180px]">{user.email}</span>
                          {user.google_id && (
                            <Badge variant="outline" className="text-xs w-fit">
                              Google
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Rol */}
                    <TableCell>
                      <Badge variant="outline" className="gap-1 whitespace-nowrap">
                        <Shield className="h-3 w-3" />
                        {user.role_name}
                      </Badge>
                    </TableCell>

                    {/* Verificado */}
                    <TableCell>
                      {user.email_verified_at ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-xs">Sí</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-orange-600">
                          <XCircle className="h-4 w-4" />
                          <span className="text-xs">No</span>
                        </div>
                      )}
                    </TableCell>

                    {/* Miembro */}
                    <TableCell 
                      className={onViewMember && user.member_id ? "cursor-pointer hover:bg-muted/50" : ""} 
                      onClick={() => user.member_id && onViewMember?.(user.member_id)}
                    >
                      {user.member_id ? (
                        <div className="flex flex-col w-full">
                          
                              <span className="text-sm font-medium ">
                                {user.name} {user.last_name}
                              </span>
                              <span className="flex items-center justify-start gap-1 w-full">
                                <Badge
                                  variant={
                                    user.member_status === "ACTIVO"
                                      ? "default"
                                      : user.member_status === "INACTIVO"
                                        ? "secondary"
                                        : "outline"
                                  }
                                  className="text-[0.6rem] w-fit"
                                >
                                  {user.member_status}
                                </Badge>

                                <ExternalLink className="h-4 w-4" />
                              </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Sin miembro</span>
                      )}
                    </TableCell>

                    {/* Equipos */}
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">
                          {user.work_teams_count} creados
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {user.team_memberships_count} miembro
                        </span>
                      </div>
                    </TableCell>

                    {/* Fecha de registro */}
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDateShort(user.created_at)}
                    </TableCell>

                    {/* Acciones */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará el usuario{" "}
                                <span className="font-medium">{user.email}</span>. Esta acción no se
                                puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDelete(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Página {pagination.currentPage} de {pagination.totalPages} ({pagination.count} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || isLoading}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages || isLoading}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
