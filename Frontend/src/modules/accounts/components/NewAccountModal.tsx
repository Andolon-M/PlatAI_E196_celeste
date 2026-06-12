import { useState } from "react"
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
import type { CreateAccountDto, TipoCuenta } from "../types"

interface NewAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (cuenta: CreateAccountDto) => Promise<void>
}

const coloresDisponibles = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#10b981", label: "Verde" },
  { value: "#f97316", label: "Naranja" },
  { value: "#ef4444", label: "Rojo" },
  { value: "#8b5cf6", label: "Morado" },
  { value: "#6b7280", label: "Gris" },
]

export function NewAccountModal({ open, onOpenChange, onSave }: NewAccountModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateAccountDto>({
    nombre: "",
    tipo: "Efectivo",
    saldo: 0,
    color: "#3b82f6",
  })

  const handleSubmit = async () => {
    if (!formData.nombre) return

    setIsLoading(true)
    try {
      await onSave(formData)
      setFormData({
        nombre: "",
        tipo: "Efectivo",
        saldo: 0,
        color: "#3b82f6",
      })
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Cuenta</DialogTitle>
          <DialogDescription>Añade una nueva cuenta bancaria o billetera virtual a tu portafolio.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Cuenta</Label>
            <Input
              id="nombre"
              placeholder="Ej: Bancolombia Ahorros"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Cuenta</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value: TipoCuenta) => setFormData({ ...formData, tipo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Digital">Billetera Digital (Nequi, Daviplata, etc.)</SelectItem>
                <SelectItem value="Banco">Cuenta Bancaria</SelectItem>
                <SelectItem value="Otro">Tarjeta / Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="saldo">Saldo Inicial (COP)</Label>
            <Input
              id="saldo"
              type="number"
              placeholder="0"
              value={formData.saldo === 0 ? "" : formData.saldo}
              onChange={(e) => setFormData({ ...formData, saldo: Number(e.target.value) })}
            />
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading || !formData.nombre}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Registrar Cuenta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
