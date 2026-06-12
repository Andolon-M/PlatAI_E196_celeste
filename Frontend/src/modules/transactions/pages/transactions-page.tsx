import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { toast } from "sonner"
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

import type { Transaction, TipoMovimiento, CreateTransactionDto, UpdateTransactionDto, Category } from "../types"
import type { Account } from "../../accounts/types"

import { transactionsService } from "../services/transactions.service"
import { accountsService } from "../../accounts/services/accounts.service"
import { categoriesService } from "../../categories/services/categories.service"

import { TransactionSummaryCards } from "../components/TransactionSummaryCards"
import { TransactionFilters } from "../components/TransactionFilters"
import { TransactionList } from "../components/TransactionList"
import { TransactionFormModal } from "../components/TransactionFormModal"
import { Spinner } from "@/shared/components/ui/spinner"

export function TransactionsPage() {
  const [movimientos, setMovimientos] = useState<Transaction[]>([])
  const [cuentas, setCuentas] = useState<Account[]>([])
  const [categorias, setCategorias] = useState<Category[]>([])
  const [isLoadingInitial, setIsLoadingInitial] = useState(true)

  // Filtros
  const [busqueda, setBusqueda] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("todas")

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [tipoNuevo, setTipoNuevo] = useState<TipoMovimiento | null>(null)
  const [movEdit, setMovEdit] = useState<Transaction | null>(null)
  const [movDelete, setMovDelete] = useState<Transaction | null>(null)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [resMovs, resCts, resCats] = await Promise.all([
        transactionsService.getTransactions(),
        accountsService.getAccounts(),
        categoriesService.getCategories().catch(() => []) // Fallback si no hay categorías creadas aún
      ])
      setMovimientos(resMovs.items || [])
      setCuentas(resCts)
      setCategorias(resCats)
    } catch (error) {
      console.error(error)
      toast.error("Error al cargar datos financieros")
    } finally {
      setIsLoadingInitial(false)
    }
  }

  const handleSave = async (data: CreateTransactionDto | UpdateTransactionDto) => {
    try {
      if (movEdit) {
        await transactionsService.updateTransaction(movEdit.id, data as UpdateTransactionDto)
        toast.success("Movimiento actualizado exitosamente")
      } else {
        await transactionsService.createTransaction(data as CreateTransactionDto)
        toast.success("Movimiento registrado exitosamente")
      }
      cargarDatos() // recargar para actualizar cuentas y movimientos
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar el movimiento")
    }
  }

  const handleDeleteConfirm = async () => {
    if (!movDelete) return
    try {
      await transactionsService.deleteTransaction(movDelete.id)
      toast.success("Movimiento eliminado exitosamente")
      setMovDelete(null)
      cargarDatos()
    } catch (error) {
      console.error(error)
      toast.error("Error al eliminar el movimiento")
    }
  }

  const openNuevo = (tipo: TipoMovimiento) => {
    setTipoNuevo(tipo)
    setMovEdit(null)
    setIsFormOpen(true)
  }

  const openEdit = (mov: Transaction) => {
    setTipoNuevo(null)
    setMovEdit(mov)
    setIsFormOpen(true)
  }

  // Filtrado local
  const movsFiltrados = movimientos.filter((m) => {
    const matchCat = filtroCategoria === "todas" || m.categoria?.nombre === filtroCategoria
    const matchSearch = m.descripcion.toLowerCase().includes(busqueda.toLowerCase()) || 
                        (m.categoria?.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
    return matchCat && matchSearch
  })

  const totalIngresos = movimientos.filter(m => m.tipo === "INGRESO").reduce((acc, m) => acc + Number(m.monto), 0)
  const totalGastos = movimientos.filter(m => m.tipo === "GASTO").reduce((acc, m) => acc + Number(m.monto), 0)

  if (isLoadingInitial) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-3">
        <Spinner className="h-8 w-8 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Cargando libro contable...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Movimientos</h2>
          <p className="text-sm text-muted-foreground">Flujo de caja y control financiero detallado</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => openNuevo("INGRESO")}>
            <ArrowUpRight className="h-4 w-4 mr-2 text-[#008080]" />
            Nuevo Ingreso
          </Button>
          <Button size="sm" className="bg-[#008080] hover:bg-[#006666] text-white" onClick={() => openNuevo("GASTO")}>
            <ArrowDownRight className="h-4 w-4 mr-2" />
            Nuevo Gasto
          </Button>
        </div>
      </div>

      <TransactionSummaryCards totalIngresos={totalIngresos} totalGastos={totalGastos} />

      <TransactionFilters 
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        filtroCategoria={filtroCategoria}
        onFiltroCategoriaChange={setFiltroCategoria}
        categorias={categorias}
      />

      <TransactionList 
        movimientos={movsFiltrados}
        onEdit={openEdit}
        onDelete={setMovDelete}
      />

      {isFormOpen && (
        <TransactionFormModal
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          tipo={tipoNuevo}
          transactionEdit={movEdit}
          cuentas={cuentas}
          onSave={handleSave}
        />
      )}

      <AlertDialog open={!!movDelete} onOpenChange={(open) => !open && setMovDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el registro "{movDelete?.descripcion}" y afectará el balance de tu cuenta relacionada. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
