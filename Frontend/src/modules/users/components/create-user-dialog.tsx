import { useState } from "react"
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
import type { CreateUserRequest, Role } from "../types"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateUserRequest) => Promise<void>
  roles: Role[] // Roles ya cargados desde la vista padre (UsersPage)
  rolesLoading?: boolean // Estado de carga de roles desde la vista padre
}

export function CreateUserDialog({ open, onOpenChange, onSubmit, roles, rolesLoading }: CreateUserDialogProps) {
  // Estados locales del formulario
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: "",
    password: "",
    role_id: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Nota: Los roles se reciben como props desde UsersPage, no se consultan aquí
  // Esto evita consultas duplicadas y mejora el rendimiento

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(formData)
      // Resetear formulario
      setFormData({
        email: "",
        password: "",
        role_id: "",
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error al crear usuario:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          <DialogDescription>Ingresa los datos del nuevo usuario</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Contraseña <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isSubmitting}
              minLength={6}
              required
            />
            <p className="text-xs text-muted-foreground">Debe tener al menos 6 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
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
                value={formData.role_id}
                onValueChange={(value) => setFormData({ ...formData, role_id: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol (opcional)" />
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
                ? "Cargando roles disponibles desde el servidor..." 
                : "Opcional: el rol se puede asignar después"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">URL de Imagen</Label>
            <Input
              id="image"
              type="url"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={formData.image || ""}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">Opcional</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.email || !formData.password}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Usuario"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
