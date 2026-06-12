import { useState, useEffect } from "react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Plus, Wallet } from "lucide-react"
import { toast } from "sonner"

import type { Account, CreateAccountDto, UpdateAccountDto, CreateTransferDto } from "../types"
import { accountsService } from "../services/accounts.service"

import { AccountCard } from "../components/AccountCard"
import { NewAccountModal } from "../components/NewAccountModal"
import { EditAccountModal } from "../components/EditAccountModal"
import { TransferModal } from "../components/TransferModal"

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value)
}

export function AccountsPage() {
  const [cuentas, setCuentas] = useState<Account[]>([])
  
  // Modals state
  const [modalNuevaCuenta, setModalNuevaCuenta] = useState(false)
  const [cuentaEdit, setCuentaEdit] = useState<Account | null>(null)
  const [cuentaTransfer, setCuentaTransfer] = useState<Account | null>(null)

  useEffect(() => {
    cargarCuentas()
  }, [])

  const cargarCuentas = async () => {
    try {
      const data = await accountsService.getAccounts()
      setCuentas(data)
    } catch (error) {
      console.error("Error al cargar cuentas:", error)
      toast.error("Error al obtener las cuentas")
    }
  }

  const handleCrearCuenta = async (data: CreateAccountDto) => {
    try {
      await accountsService.createAccount(data)
      toast.success("Cuenta creada exitosamente")
      cargarCuentas()
    } catch (error) {
      console.error("Error al crear cuenta:", error)
      toast.error("Error al crear la cuenta")
    }
  }

  const handleActualizarCuenta = async (id: number, data: UpdateAccountDto) => {
    try {
      await accountsService.updateAccount(id, data)
      toast.success("Cuenta actualizada exitosamente")
      cargarCuentas()
    } catch (error) {
      console.error("Error al actualizar cuenta:", error)
      toast.error("Error al actualizar la cuenta")
    }
  }

  const handleEliminarCuenta = async (cuenta: Account) => {
    try {
      await accountsService.deleteAccount(cuenta.id)
      toast.success("Cuenta eliminada exitosamente")
      cargarCuentas()
    } catch (error) {
      console.error("Error al eliminar cuenta:", error)
      toast.error("Error al eliminar la cuenta")
    }
  }

  const handleTransferir = async (data: CreateTransferDto) => {
    try {
      await accountsService.createTransfer(data)
      toast.success("Transferencia realizada exitosamente")
      cargarCuentas()
    } catch (error) {
      console.error("Error al transferir:", error)
      toast.error("Error al realizar la transferencia")
    }
  }

  const saldoTotal = cuentas.reduce((sum, c) => sum + Number(c.saldo), 0)

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mis Cuentas</h2>
          <p className="text-muted-foreground">Gestiona tus cuentas bancarias, billeteras digitales y efectivo</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-[#008080] hover:bg-[#006666] text-white" onClick={() => setModalNuevaCuenta(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Cuenta
          </Button>
        </div>
      </div>

      <Card className="bg-primary text-primary-foreground shadow-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm opacity-80 font-medium tracking-wide uppercase">Saldo Total Consolidado</p>
            <p className="text-4xl md:text-5xl font-bold mt-2 tracking-tight">{formatCurrency(saldoTotal)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cuentas.map(cuenta => (
          <AccountCard 
            key={cuenta.id} 
            cuenta={cuenta} 
            onEdit={setCuentaEdit}
            onDelete={handleEliminarCuenta}
            onTransfer={setCuentaTransfer}
          />
        ))}
      </div>

      {cuentas.length === 0 && (
        <div className="text-center py-16 border rounded-xl bg-muted/10 border-dashed border-muted-foreground/20">
          <Wallet className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-base font-semibold text-muted-foreground">Aún no tienes cuentas registradas</p>
          <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto mt-1">
            Empieza creando una cuenta para gestionar tu saldo.
          </p>
        </div>
      )}

      {/* Modales */}
      <NewAccountModal 
        open={modalNuevaCuenta} 
        onOpenChange={setModalNuevaCuenta} 
        onSave={handleCrearCuenta} 
      />

      <EditAccountModal 
        cuenta={cuentaEdit} 
        onOpenChange={setCuentaEdit} 
        onSave={handleActualizarCuenta} 
      />

      <TransferModal 
        cuentaOrigenDefecto={cuentaTransfer} 
        cuentas={cuentas}
        onOpenChange={setCuentaTransfer} 
        onSave={handleTransferir} 
      />
    </div>
  )
}
