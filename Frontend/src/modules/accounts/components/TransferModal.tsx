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
import { Loader2, ArrowRight } from "lucide-react"
import type { Account, CreateTransferDto } from "../types"

interface TransferModalProps {
  cuentaOrigenDefecto: Account | null
  cuentas: Account[]
  onOpenChange: (cuenta: Account | null) => void
  onSave: (data: CreateTransferDto) => Promise<void>
}

export function TransferModal({ cuentaOrigenDefecto, cuentas, onOpenChange, onSave }: TransferModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateTransferDto>({
    id_cuenta_origen: 0,
    id_cuenta_destino: 0,
    monto: 0,
    fecha_transferencia: new Date().toISOString().split("T")[0],
    nota: "",
  })

  useEffect(() => {
    if (cuentaOrigenDefecto) {
      setFormData(prev => ({ ...prev, id_cuenta_origen: cuentaOrigenDefecto.id }))
    }
  }, [cuentaOrigenDefecto])

  const handleSubmit = async () => {
    if (!formData.id_cuenta_origen || !formData.id_cuenta_destino || formData.monto <= 0) return

    setIsLoading(true)
    try {
      await onSave({
        ...formData,
        fecha_transferencia: new Date(formData.fecha_transferencia).toISOString()
      })
      onOpenChange(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Cuentas destino disponibles (excluyendo la de origen)
  const cuentasDestino = cuentas.filter(c => c.id !== formData.id_cuenta_origen)

  return (
    <Dialog open={!!cuentaOrigenDefecto} onOpenChange={() => onOpenChange(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transferir Fondos</DialogTitle>
          <DialogDescription>
            Mueve dinero entre tus cuentas sin que afecte tus reportes de gastos e ingresos.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between gap-2 bg-muted/50 p-3 rounded-lg border border-border">
            <div className="flex-1 space-y-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Desde</Label>
              <Select
                value={formData.id_cuenta_origen ? String(formData.id_cuenta_origen) : undefined}
                onValueChange={(val) => {
                  const numVal = Number(val)
                  setFormData(prev => ({ 
                    ...prev, 
                    id_cuenta_origen: numVal,
                    // Resetear cuenta destino si es la misma que la nueva origen
                    id_cuenta_destino: prev.id_cuenta_destino === numVal ? 0 : prev.id_cuenta_destino 
                  }))
                }}
              >
                <SelectTrigger className="border-0 bg-transparent h-auto p-0 shadow-none focus:ring-0 font-medium">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {cuentas.map(c => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.nombre} (${c.saldo})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-background border shadow-sm">
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex-1 space-y-1 text-right">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Hacia</Label>
              <Select
                value={formData.id_cuenta_destino ? String(formData.id_cuenta_destino) : undefined}
                onValueChange={(val) => setFormData(prev => ({ ...prev, id_cuenta_destino: Number(val) }))}
                disabled={!formData.id_cuenta_origen}
              >
                <SelectTrigger className="border-0 bg-transparent h-auto p-0 shadow-none focus:ring-0 font-medium text-right flex-row-reverse w-full" style={{direction: "rtl"}}>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {cuentasDestino.length === 0 ? (
                    <SelectItem value="0" disabled>No hay otras cuentas</SelectItem>
                  ) : (
                    cuentasDestino.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.nombre}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto">Monto a Transferir (COP)</Label>
            <Input
              id="monto"
              type="number"
              placeholder="0"
              value={formData.monto === 0 ? "" : formData.monto}
              onChange={(e) => setFormData(prev => ({ ...prev, monto: Number(e.target.value) }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fecha">Fecha</Label>
            <Input
              id="fecha"
              type="date"
              value={formData.fecha_transferencia}
              onChange={(e) => setFormData(prev => ({ ...prev, fecha_transferencia: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nota">Nota (Opcional)</Label>
            <Input
              id="nota"
              placeholder="Ej: Transferencia de quincena"
              value={formData.nota}
              onChange={(e) => setFormData(prev => ({ ...prev, nota: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(null)}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !formData.id_cuenta_origen || !formData.id_cuenta_destino || formData.monto <= 0}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar Transferencia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
