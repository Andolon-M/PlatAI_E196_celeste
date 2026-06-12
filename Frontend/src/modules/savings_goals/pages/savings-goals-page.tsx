import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { Button } from "@/shared/components/ui/button"
import { Target, Plus, Pause, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import type { SavingsGoal, CreateSavingsGoalDto, CreateContributionDto } from "../types"
import { savingsGoalsService } from "../services/savings-goals.service"

import { SavingsGoalCard } from "../components/SavingsGoalCard"
import { NewGoalModal } from "../components/NewGoalModal"
import { ContributionModal } from "../components/ContributionModal"
import { GoalDetailsModal } from "../components/GoalDetailsModal"

export function SavingsGoalsPage() {
  const [metas, setMetas] = useState<SavingsGoal[]>([])
  const [activeTab, setActiveTab] = useState("activas")
  
  // Modals state
  const [modalNuevaMeta, setModalNuevaMeta] = useState(false)
  const [modalAporte, setModalAporte] = useState<SavingsGoal | null>(null)
  const [modalDetalle, setModalDetalle] = useState<SavingsGoal | null>(null)

  useEffect(() => {
    cargarMetas()
  }, [])

  const cargarMetas = async () => {
    try {
      const data = await savingsGoalsService.getGoals()
      setMetas(data)
    } catch (error) {
      console.error("Error al cargar metas:", error)
      toast.error("Error al obtener las metas de ahorro")
    }
  }

  const handleCrearMeta = async (data: CreateSavingsGoalDto) => {
    try {
      await savingsGoalsService.createGoal(data)
      toast.success("Meta creada exitosamente")
      cargarMetas() // Recargar para obtener el ID real
    } catch (error) {
      console.error("Error al crear meta:", error)
      toast.error("Error al crear la meta")
    }
  }

  const handleRegistrarAporte = async (goalId: number, data: CreateContributionDto) => {
    try {
      await savingsGoalsService.createContribution(goalId, data)
      toast.success("Aporte registrado exitosamente")
      cargarMetas()
    } catch (error) {
      console.error("Error al registrar aporte:", error)
      toast.error("Error al registrar el aporte")
    }
  }

  const handlePausarMeta = async (meta: SavingsGoal) => {
    const nuevoEstado = meta.estado === "pausada" ? "activa" : "pausada"
    try {
      await savingsGoalsService.updateGoal(meta.id, { estado: nuevoEstado })
      toast.success(`Meta ${nuevoEstado === "activa" ? "reanudada" : "pausada"} exitosamente`)
      cargarMetas()
    } catch (error) {
      console.error("Error al actualizar meta:", error)
      toast.error("Error al actualizar el estado de la meta")
    }
  }

  const handleEliminarMeta = async (meta: SavingsGoal) => {
    try {
      await savingsGoalsService.deleteGoal(meta.id)
      toast.success("Meta eliminada exitosamente")
      cargarMetas()
    } catch (error) {
      console.error("Error al eliminar meta:", error)
      toast.error("Error al eliminar la meta")
    }
  }

  const metasActivas = metas.filter((m) => m.estado === "activa")
  const metasPausadas = metas.filter((m) => m.estado === "pausada")
  const metasCompletadas = metas.filter((m) => m.estado === "completada")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <TabsList>
          <TabsTrigger value="activas">Activas ({metasActivas.length})</TabsTrigger>
          <TabsTrigger value="pausadas">Pausadas ({metasPausadas.length})</TabsTrigger>
          <TabsTrigger value="completadas">Completadas ({metasCompletadas.length})</TabsTrigger>
        </TabsList>

        <Button size="sm" className="bg-[#008080] hover:bg-[#006666] text-white" onClick={() => setModalNuevaMeta(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nueva Meta
        </Button>
      </div>

      <TabsContent value="activas" className="mt-0">
        {metasActivas.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metasActivas.map(meta => (
              <SavingsGoalCard 
                key={meta.id} 
                meta={meta} 
                onPausar={handlePausarMeta}
                onEliminar={handleEliminarMeta}
                onAportar={setModalAporte}
                onVerDetalles={setModalDetalle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-xl bg-muted/10 border-dashed border-muted-foreground/20">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-base font-semibold text-muted-foreground">Esperando metas...</p>
            <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto mt-1">
              No tienes metas activas en este momento.
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="pausadas" className="mt-0">
        {metasPausadas.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metasPausadas.map(meta => (
              <SavingsGoalCard 
                key={meta.id} 
                meta={meta} 
                onPausar={handlePausarMeta}
                onEliminar={handleEliminarMeta}
                onAportar={setModalAporte}
                onVerDetalles={setModalDetalle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-xl bg-muted/10 border-dashed border-muted-foreground/20">
            <Pause className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-base font-semibold text-muted-foreground">No hay metas pausadas</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="completadas" className="mt-0">
        {metasCompletadas.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metasCompletadas.map(meta => (
              <SavingsGoalCard 
                key={meta.id} 
                meta={meta} 
                onPausar={handlePausarMeta}
                onEliminar={handleEliminarMeta}
                onAportar={setModalAporte}
                onVerDetalles={setModalDetalle}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-xl bg-muted/10 border-dashed border-muted-foreground/20">
            <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-base font-semibold text-muted-foreground">No hay metas completadas aún</p>
          </div>
        )}
      </TabsContent>

      {/* Modales */}
      <NewGoalModal 
        open={modalNuevaMeta} 
        onOpenChange={setModalNuevaMeta} 
        onSave={handleCrearMeta} 
      />

      <ContributionModal 
        meta={modalAporte} 
        onOpenChange={setModalAporte} 
        onSave={handleRegistrarAporte} 
      />

      <GoalDetailsModal 
        meta={modalDetalle} 
        onOpenChange={setModalDetalle} 
      />
    </Tabs>
  )
}
