import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Progress } from "@/shared/components/ui/progress"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { Target, AlertTriangle, CheckCircle2, Pause, Play, Calendar, Coins, Trash2 } from "lucide-react"
import type { SavingsGoal } from "../types"
import { useState } from "react"

interface SavingsGoalCardProps {
  meta: SavingsGoal
  onPausar: (meta: SavingsGoal) => void
  onEliminar: (meta: SavingsGoal) => void
  onAportar: (meta: SavingsGoal) => void
  onVerDetalles: (meta: SavingsGoal) => void
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

export function SavingsGoalCard({ meta, onPausar, onEliminar, onAportar, onVerDetalles }: SavingsGoalCardProps) {
  const [alertaPausar, setAlertaPausar] = useState(false)
  const [alertaEliminar, setAlertaEliminar] = useState(false)

  const progreso = meta.monto_objetivo > 0 ? (meta.ahorrado / meta.monto_objetivo) * 100 : 0
  const diasRestantes = Math.ceil(
    (new Date(meta.fecha_limite).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
  const enRiesgo = diasRestantes < 7 && progreso < 70 && meta.estado === "activa"

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "bg-destructive/10 text-destructive border-destructive/20"
      case "media":
        return "bg-warning/10 text-warning-foreground border-warning/20"
      default:
        return "bg-muted text-muted-foreground border-muted"
    }
  }

  // Si tiene un color personalizado, lo aplicamos al fondo del ícono principal
  const iconBgColor = meta.color || (meta.estado === "completada" ? "bg-accent/20" : "bg-primary/10")

  return (
    <>
      <Card className={`relative ${meta.estado === "pausada" ? "opacity-75" : ""}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center`}
                style={{ backgroundColor: meta.color ? `${meta.color}33` : undefined }}
              >
                {meta.estado === "completada" ? (
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                ) : (
                  <Target className="h-5 w-5 text-primary" style={{ color: meta.color }} />
                )}
              </div>
              <div>
                <CardTitle className="text-base">{meta.nombre}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={getPrioridadColor(meta.prioridad)}>
                    {meta.prioridad}
                  </Badge>
                  {meta.estado === "pausada" && <Badge variant="secondary">Pausada</Badge>}
                  {meta.estado === "completada" && <Badge className="bg-accent text-white">Completada</Badge>}
                  {enRiesgo && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3 mr-1" /> En riesgo
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-1">
              {meta.estado !== "completada" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setAlertaPausar(true)}
                >
                  {meta.estado === "pausada" ? <Play className="h-4 w-4 text-accent" /> : <Pause className="h-4 w-4" />}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setAlertaEliminar(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{Math.min(progreso, 100).toFixed(0)}%</span>
            </div>
            <Progress value={Math.min(progreso, 100)} className="h-3" />
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{formatCurrency(meta.ahorrado)}</span>
              <span className="text-muted-foreground">{formatCurrency(meta.monto_objetivo)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(meta.fecha_limite)}</span>
            </div>
            {meta.estado !== "completada" && (
              <span className={diasRestantes < 7 ? "text-destructive font-medium" : "text-muted-foreground"}>
                {diasRestantes > 0 ? `${diasRestantes} días restantes` : "Vencida"}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => onVerDetalles(meta)}>
              Ver detalle
            </Button>
            {meta.estado === "activa" && (
              <Button className="flex-1" onClick={() => onAportar(meta)}>
                <Coins className="h-4 w-4 mr-1" /> Aportar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={alertaPausar} onOpenChange={setAlertaPausar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {meta.estado === "pausada" ? "Reanudar meta" : "Pausar meta"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de cambiar el estado de "{meta.nombre}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              onPausar(meta)
              setAlertaPausar(false)
            }}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={alertaEliminar} onOpenChange={setAlertaEliminar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar meta de ahorro?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar permanentemente la meta "{meta.nombre}"? Esta acción borrará también todo su historial de aportes y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onEliminar(meta)
                setAlertaEliminar(false)
              }} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
