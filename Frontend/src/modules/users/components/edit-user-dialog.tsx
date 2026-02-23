import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Loader2 } from "lucide-react"
import type { User, UpdateUserRequest, Role } from "../types"

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onSubmit: (data: UpdateUserRequest) => Promise<void>
  roles: Role[] // Roles ya cargados desde la vista padre (UsersPage)
  rolesLoading?: boolean // Estado de carga de roles desde la vista padre
}

export function EditUserDialog({ open, onOpenChange, user, onSubmit, roles, rolesLoading }: EditUserDialogProps) {
  // Estados locales del formulario
  const [formData, setFormData] = useState<UpdateUserRequest>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Nota: Los roles se reciben como props desde UsersPage, no se consultan aquí
  // Esto evita consultas duplicadas y mejora el rendimiento

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        role_id: user.role_id,
        image: user.image || "",
      })
    }
  }, [user])

  const handleSubmit = async () => {
    if (!user) return

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (error) {
      console.error("Error al actualizar usuario:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
          <DialogDescription>Modifica los datos del usuario</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-password">Nueva Contraseña</Label>
            <Input
              id="edit-password"
              type="password"
              placeholder="Dejar vacío para mantener la actual"
              value={formData.password || ""}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isSubmitting}
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">
              Solo completa este campo si deseas cambiar la contraseña
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-role">Rol</Label>
            {rolesLoading ? (
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Cargando roles...</span>
              </div>
            ) : !Array.isArray(roles) || roles.length === 0 ? (
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted">
                <span className="text-sm text-muted-foreground">No hay roles disponibles</span>
              </div>
            ) : (
              <Select
                value={formData.role_id || user.role_id}
                onValueChange={(value) => setFormData({ ...formData, role_id: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">
              {rolesLoading 
                ? "Cargando roles disponibles..." 
                : `Rol actual: ${user.role_name}`}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-image">URL de Imagen</Label>
            <Input
              id="edit-image"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={formData.image || ""}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              disabled={isSubmitting}
            />
          </div>

          {/* Información del miembro asociado */}
          {user.member_id && (
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <p className="text-sm font-medium">Miembro Asociado</p>
              <p className="text-sm text-muted-foreground">
                {user.name} {user.last_name}
              </p>
              <p className="text-xs text-muted-foreground">DNI: {user.dni}</p>
              <p className="text-xs text-muted-foreground">Estado: {user.member_status}</p>
            </div>
          )}

          {/* Estadísticas del usuario */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Equipos creados</p>
              <p className="text-lg font-bold">{user.work_teams_count}</p>
            </div>
            <div className="p-2 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Equipos miembro</p>
              <p className="text-lg font-bold">{user.team_memberships_count}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
