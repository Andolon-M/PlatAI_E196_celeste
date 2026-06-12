import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import type { SavingsGoal, CreateContributionDto } from "../types"
import { accountsService } from "../../accounts/services/accounts.service"
import type { Account } from "../../accounts/services/accounts.service"
import { toast } from "sonner"

interface ContributionModalProps {
  meta: SavingsGoal | null
  onOpenChange: (meta: SavingsGoal | null) => void
  onSave: (goalId: number, data: CreateContributionDto) => Promise<void>
}

export function ContributionModal({ meta, onOpenChange, onSave }: ContributionModalProps) {
  const [monto, setMonto] = useState("")
  const [cuentaId, setCuentaId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [cuentas, setCuentas] = useState<Account[]>([])
  const [isLoadingCuentas, setIsLoadingCuentas] = useState(false)

  useEffect(() => {
    if (meta) {
      cargarCuentas()
      setMonto("")
      setCuentaId("")
    }
  }, [meta])

  const cargarCuentas = async () => {
    setIsLoadingCuentas(true)
    try {
      const cuentasData = await accountsService.getAccounts()
      setCuentas(cuentasData)
      if (cuentasData.length > 0) {
        setCuentaId(cuentasData[0].id.toString())
      }
    } catch (error) {
      console.error("Error al cargar cuentas:", error)
      toast.error("No se pudieron cargar las cuentas disponibles")
    } finally {
      setIsLoadingCuentas(false)
    }
  }

  const handleSubmit = async () => {
    if (!meta || !monto || !cuentaId) return

    setIsLoading(true)
    try {
      await onSave(meta.id, {
        monto: Number(monto),
        id_cuenta: Number(cuentaId),
        fecha_aporte: new Date().toISOString()
      })
      onOpenChange(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={!!meta} onOpenChange={() => onOpenChange(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Aporte para {meta?.nombre}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="montoAporte">Monto a aportar (COP)</Label>
            <Input
              id="montoAporte"
              type="number"
              placeholder="0"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cuentaDestino">Cuenta de origen</Label>
            <Select value={cuentaId} onValueChange={setCuentaId} disabled={isLoadingCuentas || cuentas.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingCuentas ? "Cargando..." : "Selecciona una cuenta"} />
              </SelectTrigger>
              <SelectContent>
                {cuentas.map(cuenta => (
                  <SelectItem key={cuenta.id} value={cuenta.id.toString()}>
                    {cuenta.nombre} - Saldo: ${cuenta.saldo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cuentas.length === 0 && !isLoadingCuentas && (
              <p className="text-sm text-destructive mt-1">No tienes cuentas registradas para hacer el aporte.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(null)}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !monto || !cuentaId || Number(monto) <= 0}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Registrar aporte
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
