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
import { Loader2, AlertTriangle } from "lucide-react"
import type { Transaction, TipoMovimiento, MetodoPago, CreateTransactionDto, UpdateTransactionDto } from "../types"
import type { Category } from "../../categories/types"
import type { Account } from "../../accounts/types"
import { categoriesService } from "../../categories/services/categories.service"

interface TransactionFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: TipoMovimiento | null;
  transactionEdit: Transaction | null;
  cuentas: Account[];
  onSave: (data: CreateTransactionDto | UpdateTransactionDto) => Promise<void>;
}

export function TransactionFormModal({ 
  isOpen, 
  onOpenChange, 
  tipo, 
  transactionEdit, 
  cuentas, 
  onSave 
}: TransactionFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingCats, setIsLoadingCats] = useState(false)
  const [localCategorias, setLocalCategorias] = useState<Category[]>([])
  const [formData, setFormData] = useState<{
    descripcion: string;
    monto: number | string;
    id_categoria: string;
    id_cuenta: string;
    fecha: string;
    metodo_pago: MetodoPago | "";
  }>({
    descripcion: "",
    monto: "",
    id_categoria: "",
    id_cuenta: "",
    fecha: new Date().toISOString().split("T")[0],
    metodo_pago: "",
  })

  // Set form data when edit or open changes
  useEffect(() => {
    if (transactionEdit) {
      setFormData({
        descripcion: transactionEdit.descripcion,
        monto: transactionEdit.monto,
        id_categoria: String(transactionEdit.id_categoria),
        id_cuenta: String(transactionEdit.id_cuenta),
        fecha: transactionEdit.fecha.split("T")[0],
        metodo_pago: transactionEdit.metodo_pago,
      })
    } else if (isOpen) {
      setFormData({
        descripcion: "",
        monto: "",
        id_categoria: "",
        id_cuenta: cuentas.length > 0 ? String(cuentas[0].id) : "",
        fecha: new Date().toISOString().split("T")[0],
        metodo_pago: "EFECTIVO",
      })
    }
  }, [transactionEdit, isOpen, tipo, cuentas])

  // Obtener categorías desde el endpoint cuando cambia el tipo
  const tipoActual = transactionEdit ? transactionEdit.tipo : (tipo || "INGRESO")
  
  useEffect(() => {
    if (isOpen) {
      setIsLoadingCats(true)
      categoriesService.getCategories(tipoActual.toLowerCase())
        .then(data => {
          setLocalCategorias(data)
          // Si no hay categoría seleccionada, seleccionar la primera disponible
          setFormData(prev => ({
            ...prev,
            id_categoria: prev.id_categoria || (data.length > 0 ? String(data[0].id) : "")
          }))
        })
        .catch(err => console.error("Error al cargar categorías", err))
        .finally(() => setIsLoadingCats(false))
    }
  }, [isOpen, tipoActual])

  const handleSubmit = async () => {
    if (!formData.descripcion || !formData.monto || !formData.id_categoria || !formData.id_cuenta || !formData.metodo_pago) return

    setIsLoading(true)
    try {
      const payload = {
        descripcion: formData.descripcion,
        monto: Number(formData.monto),
        id_categoria: Number(formData.id_categoria),
        id_cuenta: Number(formData.id_cuenta),
        fecha: new Date(formData.fecha).toISOString(),
        metodo_pago: formData.metodo_pago as MetodoPago,
        tipo: transactionEdit ? transactionEdit.tipo : (tipo || "INGRESO")
      }
      await onSave(payload)
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  // Validaciones
  const cuentaSeleccionada = cuentas.find(c => c.id === Number(formData.id_cuenta))

  const isGasto = tipoActual === "GASTO"
  const excedeSaldo = isGasto && cuentaSeleccionada && Number(formData.monto) > cuentaSeleccionada.saldo

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {transactionEdit ? "Modificar Transacción" : tipo === "INGRESO" ? "Registrar Ingreso" : "Registrar Gasto"}
          </DialogTitle>
          <DialogDescription>
            Completa los detalles para asentar el movimiento financiero.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              placeholder="Ej: Pago de nómina"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="monto">Monto (COP)</Label>
              <Input
                id="monto"
                type="number"
                placeholder="0"
                value={formData.monto}
                onChange={(e) => setFormData(prev => ({ ...prev, monto: e.target.value }))}
              />
              {excedeSaldo && (
                <div className="flex items-center gap-1 text-[11px] text-destructive font-medium mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  <span>Excede saldo en cuenta</span>
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="categoria">Categoría</Label>
              <Select
                value={formData.id_categoria}
                onValueChange={(val) => setFormData(prev => ({ ...prev, id_categoria: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCats ? "Cargando..." : "Seleccionar"} />
                </SelectTrigger>
                <SelectContent>
                  {localCategorias.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.nombre}</SelectItem>
                  ))}
                  {localCategorias.length === 0 && !isLoadingCats && <SelectItem value="none" disabled>No hay categorías</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cuenta">Cuenta Bancaria</Label>
              <Select
                value={formData.id_cuenta}
                onValueChange={(val) => setFormData(prev => ({ ...prev, id_cuenta: val }))}
              >
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {cuentas.map((cta) => (
                    <SelectItem key={cta.id} value={String(cta.id)}>
                      {cta.nombre} (${cta.saldo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="metodopago">Método de Pago</Label>
            <Select
              value={formData.metodo_pago}
              onValueChange={(val) => setFormData(prev => ({ ...prev, metodo_pago: val as MetodoPago }))}
            >
              <SelectTrigger><SelectValue placeholder="Seleccionar método" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                <SelectItem value="TARJETA_DEBITO">Tarjeta Débito</SelectItem>
                <SelectItem value="TARJETA_CREDITO">Tarjeta Crédito</SelectItem>
                <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                <SelectItem value="OTRO">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            size="sm" 
            onClick={handleSubmit} 
            disabled={isLoading || !formData.descripcion || !formData.monto || !formData.id_categoria || !formData.id_cuenta || !formData.metodo_pago}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {transactionEdit ? "Guardar cambios" : "Registrar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
