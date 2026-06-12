import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Loader2 } from "lucide-react"
import type { Account, UpdateAccountDto, TipoCuenta } from "../types"

interface EditAccountModalProps {
  cuenta: Account | null
  onOpenChange: (cuenta: Account | null) => void
  onSave: (id: number, data: UpdateAccountDto) => Promise<void>
}

const coloresDisponibles = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#10b981", label: "Verde" },
  { value: "#f97316", label: "Naranja" },
  { value: "#ef4444", label: "Rojo" },
  { value: "#8b5cf6", label: "Morado" },
  { value: "#6b7280", label: "Gris" },
]

export function EditAccountModal({ cuenta, onOpenChange, onSave }: EditAccountModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateAccountDto>({
    nombre: "",
    tipo: "Efectivo",
    color: "#3b82f6",
  })

  useEffect(() => {
    if (cuenta) {
      setFormData({
        nombre: cuenta.nombre,
        tipo: cuenta.tipo,
        color: cuenta.color || "#3b82f6",
      })
    }
  }, [cuenta])

  const handleSubmit = async () => {
    if (!cuenta || !formData.nombre) return

    setIsLoading(true)
    try {
      await onSave(cuenta.id, formData)
      onOpenChange(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={!!cuenta} onOpenChange={() => onOpenChange(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Cuenta</DialogTitle>
          <DialogDescription>Modifica los detalles de la cuenta "{cuenta?.nombre}". Nota: El saldo no se puede editar directamente, debes registrar un movimiento o transferencia para afectarlo.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-nombre">Nombre de la Cuenta</Label>
            <Input
              id="edit-nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-tipo">Tipo de Cuenta</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: TipoCuenta) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Digital">Billetera Digital</SelectItem>
                <SelectItem value="Banco">Cuenta Bancaria</SelectItem>
                <SelectItem value="Otro">Tarjeta / Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Color de Identificación</Label>
            <div className="flex gap-3">
              {coloresDisponibles.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c.value })}
                  className="w-8 h-8 rounded-full border border-black/10 transition-all"
                  style={{ 
                    backgroundColor: c.value,
                    boxShadow: formData.color === c.value ? `0 0 0 2px white, 0 0 0 4px ${c.value}` : "none"
                  }}
                  aria-label={`Color ${c.label}`}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(null)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !formData.nombre}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
