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
import type { CreateSavingsGoalDto, PrioridadMeta } from "../types"

interface NewGoalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (goal: CreateSavingsGoalDto) => Promise<void>
}

const colors = [
  { value: "#ef4444", label: "Rojo" },
  { value: "#f97316", label: "Naranja" },
  { value: "#eab308", label: "Amarillo" },
  { value: "#22c55e", label: "Verde" },
  { value: "#3b82f6", label: "Azul" },
  { value: "#8b5cf6", label: "Morado" },
  { value: "#ec4899", label: "Rosa" },
]

export function NewGoalModal({ open, onOpenChange, onSave }: NewGoalModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateSavingsGoalDto>({
    nombre: "",
    monto_objetivo: 0,
    fecha_limite: "",
    prioridad: "media",
    color: "#3b82f6" // Color por defecto
  })

  const handleSubmit = async () => {
    if (!formData.nombre || formData.monto_objetivo <= 0 || !formData.fecha_limite) return

    setIsLoading(true)
    try {
      // Convertir la fecha al formato ISO
      const payload = {
        ...formData,
        fecha_limite: new Date(formData.fecha_limite).toISOString()
      }
      await onSave(payload)
      setFormData({
        nombre: "",
        monto_objetivo: 0,
        fecha_limite: "",
        prioridad: "media",
        color: "#3b82f6"
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
          <DialogTitle>Crear Nueva Meta</DialogTitle>
          <DialogDescription>Establece un nuevo objetivo de ahorro</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la meta</Label>
            <Input
              id="nombre"
              placeholder="Ej: Laptop nueva"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="objetivo">Monto objetivo (COP)</Label>
            <Input
              id="objetivo"
              type="number"
              placeholder="0"
              value={formData.monto_objetivo || ""}
              onChange={(e) => setFormData({ ...formData, monto_objetivo: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fechaLimite">Fecha límite</Label>
            <Input
              id="fechaLimite"
              type="date"
              value={formData.fecha_limite}
              onChange={(e) => setFormData({ ...formData, fecha_limite: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prioridad">Prioridad</Label>
            <Select
              value={formData.prioridad}
              onValueChange={(value: PrioridadMeta) =>
                setFormData({ ...formData, prioridad: value })
              }
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Color de la meta</Label>
            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    formData.color === color.value ? "border-primary scale-110 shadow-md" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.value }}
                  aria-label={`Color ${color.label}`}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !formData.nombre || formData.monto_objetivo <= 0 || !formData.fecha_limite}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
            Crear meta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
