import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
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
import { Wallet, Smartphone, Building, CreditCard, MoreVertical, Edit, ArrowRightLeft, Trash2 } from "lucide-react"
import { useState } from "react"
import type { Account } from "../types"

interface AccountCardProps {
  cuenta: Account
  onEdit: (cuenta: Account) => void
  onDelete: (cuenta: Account) => void
  onTransfer: (cuenta: Account) => void
}

const iconosPorTipo = {
  Efectivo: Wallet,
  Digital: Smartphone,
  Banco: Building,
  Otro: CreditCard,
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value)
}

export function AccountCard({ cuenta, onEdit, onDelete, onTransfer }: AccountCardProps) {
  const [alertaEliminar, setAlertaEliminar] = useState(false)
  const Icono = iconosPorTipo[cuenta.tipo] || Wallet

  return (
    <>
      <Card className="relative overflow-hidden group">
        <div 
          className="absolute top-0 left-0 w-1 h-full transition-all duration-300 group-hover:w-2" 
          style={{ backgroundColor: cuenta.color || "#6b7280" }}
        />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: cuenta.color ? `${cuenta.color}20` : "#6b728020" }}
            >
              <Icono className="h-5 w-5" style={{ color: cuenta.color || "#6b7280" }} />
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {cuenta.tipo}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onTransfer(cuenta)}>
                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                    <span>Transferir</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(cuenta)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setAlertaEliminar(true)}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardTitle className="text-base mt-2 line-clamp-1" title={cuenta.nombre}>
            {cuenta.nombre}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatCurrency(cuenta.saldo)}</p>
        </CardContent>
      </Card>

      <AlertDialog open={alertaEliminar} onOpenChange={setAlertaEliminar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cuenta bancaria?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar permanentemente la cuenta "{cuenta.nombre}"? Esta acción borrará el registro de la cuenta, aunque podrías perder consistencia en el historial de transferencias vinculadas. No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                onDelete(cuenta)
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
