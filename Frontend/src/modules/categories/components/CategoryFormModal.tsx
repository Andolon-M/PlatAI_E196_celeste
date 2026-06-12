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
import { Loader2, Tag, Coffee, ShoppingBag, Home, Zap, Car, Bus, Plane, Smartphone, Monitor, Book, HeartPulse, Utensils, Music, GraduationCap, Briefcase, Gift, DollarSign } from "lucide-react"
import type { Category, TipoCategoria, CreateCategoryDto, UpdateCategoryDto } from "../types"

interface CategoryFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryEdit: Category | null;
  onSave: (data: CreateCategoryDto | UpdateCategoryDto) => Promise<void>;
}

const PREDEFINED_COLORS = [
  "#008080", "#2563eb", "#db2777", "#dc2626", "#ea580c", 
  "#16a34a", "#8b5cf6", "#0f766e", "#334155", "#b45309"
]

const ICONS_LIST = [
  { name: "Tag", icon: Tag },
  { name: "Coffee", icon: Coffee },
  { name: "ShoppingBag", icon: ShoppingBag },
  { name: "Home", icon: Home },
  { name: "Utensils", icon: Utensils },
  { name: "Zap", icon: Zap },
  { name: "Car", icon: Car },
  { name: "Bus", icon: Bus },
  { name: "Plane", icon: Plane },
  { name: "Smartphone", icon: Smartphone },
  { name: "Monitor", icon: Monitor },
  { name: "Book", icon: Book },
  { name: "HeartPulse", icon: HeartPulse },
  { name: "Music", icon: Music },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Briefcase", icon: Briefcase },
  { name: "Gift", icon: Gift },
  { name: "DollarSign", icon: DollarSign }
]

export function CategoryFormModal({ isOpen, onOpenChange, categoryEdit, onSave }: CategoryFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<{
    nombre: string;
    tipo: TipoCategoria;
    color: string;
    icono: string;
  }>({
    nombre: "",
    tipo: "GASTO",
    color: PREDEFINED_COLORS[0],
    icono: "Tag"
  })

  useEffect(() => {
    if (categoryEdit) {
      setFormData({
        nombre: categoryEdit.nombre,
        tipo: categoryEdit.tipo,
        color: categoryEdit.color || PREDEFINED_COLORS[0],
        icono: categoryEdit.icono || "Tag"
      })
    } else if (isOpen) {
      setFormData({
        nombre: "",
        tipo: "GASTO",
        color: PREDEFINED_COLORS[0],
        icono: "Tag"
      })
    }
  }, [categoryEdit, isOpen])

  const handleSubmit = async () => {
    if (!formData.nombre) return

    setIsLoading(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  const SelectedIcon = ICONS_LIST.find(i => i.name === formData.icono)?.icon || Tag;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {categoryEdit ? "Modificar Categoría" : "Nueva Categoría"}
          </DialogTitle>
          <DialogDescription>
            Personaliza el rubro para clasificar tus movimientos financieros.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre de Categoría</Label>
            <Input
              id="nombre"
              placeholder="Ej: Alimentación, Transporte..."
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tipo">Naturaleza</Label>
            <Select
              value={formData.tipo}
              onValueChange={(val) => setFormData(prev => ({ ...prev, tipo: val as TipoCategoria }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INGRESO">Exclusiva para Ingresos</SelectItem>
                <SelectItem value="GASTO">Exclusiva para Gastos</SelectItem>
                <SelectItem value="AMBOS">Disponible para Ambos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Color Identificativo</Label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  type="button"
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ícono</Label>
            <div className="grid grid-cols-6 gap-2 bg-muted/30 p-2 rounded-xl border">
              {ICONS_LIST.map(({ name, icon: IconComponent }) => (
                <button
                  key={name}
                  onClick={() => setFormData(prev => ({ ...prev, icono: name }))}
                  className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                    formData.icono === name ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                  }`}
                  type="button"
                  title={name}
                >
                  <IconComponent className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Vista previa */}
          <div className="mt-4 p-4 border rounded-xl flex items-center gap-3 justify-center bg-muted/10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: formData.color }}>
              <SelectedIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium">{formData.nombre || "Sin nombre"}</span>
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            size="sm" 
            onClick={handleSubmit} 
            disabled={isLoading || !formData.nombre}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {categoryEdit ? "Guardar cambios" : "Crear categoría"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
