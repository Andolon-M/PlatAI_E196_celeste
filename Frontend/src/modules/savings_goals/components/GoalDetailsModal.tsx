import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog"
import { Button } from "@/shared/components/ui/button"
import { Progress } from "@/shared/components/ui/progress"
import type { SavingsGoal, GoalContribution } from "../types"
import { savingsGoalsService } from "../services/savings-goals.service"
import { Loader2 } from "lucide-react"

interface GoalDetailsModalProps {
  meta: SavingsGoal | null
  onOpenChange: (meta: SavingsGoal | null) => void
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function GoalDetailsModal({ meta, onOpenChange }: GoalDetailsModalProps) {
  const [aportes, setAportes] = useState<GoalContribution[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (meta) {
      cargarAportes(meta.id)
    } else {
      setAportes([])
    }
  }, [meta])

  const cargarAportes = async (id: number) => {
    setIsLoading(true)
    try {
      const data = await savingsGoalsService.getContributions(id)
      setAportes(data)
    } catch (error) {
      console.error("Error al cargar aportes:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!meta) return null

  const progreso = meta.monto_objetivo > 0 ? (meta.ahorrado / meta.monto_objetivo) * 100 : 0

  return (
    <Dialog open={!!meta} onOpenChange={() => onOpenChange(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{meta.nombre}</DialogTitle>
          <DialogDescription>Historial de aportes</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Progress value={Math.min(progreso, 100)} className="h-3" />
            <div className="flex justify-between text-sm">
              <span>{formatCurrency(meta.ahorrado)}</span>
              <span>de {formatCurrency(meta.monto_objetivo)}</span>
            </div>
          </div>
          
          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : aportes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sin aportes registrados.</p>
            ) : (
              aportes.map((a, i) => (
                <div key={i} className="flex justify-between p-2 bg-muted/40 rounded text-sm">
                  <span>{formatDate(a.fecha_aporte)}</span>
                  <span className="font-semibold text-accent">+{formatCurrency(a.monto)}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(null)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
