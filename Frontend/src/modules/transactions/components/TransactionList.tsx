import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { ArrowUpRight, ArrowDownRight, MoreVertical, Edit, Trash2, Calendar } from "lucide-react"
import type { Transaction } from "../types"

interface TransactionListProps {
  movimientos: Transaction[];
  onEdit: (mov: Transaction) => void;
  onDelete: (mov: Transaction) => void;
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
    timeZone: 'UTC'
  })
}

export function TransactionList({ movimientos, onEdit, onDelete }: TransactionListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Historial de Movimientos</CardTitle>
        <CardDescription>Visualizando {movimientos.length} registros contables</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {movimientos.map((mov) => (
          <div key={mov.id} className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                mov.tipo === "INGRESO" ? "bg-[#008080]/10" : "bg-destructive/10"
              }`}>
                {mov.tipo === "INGRESO" ? (
                  <ArrowUpRight className="h-4 w-4 text-[#008080]" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground line-clamp-1">{mov.descripcion}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal truncate max-w-[120px]">
                    {mov.categoria?.nombre || 'Sin categoría'}
                  </Badge>
                  <span>•</span>
                  <span className="font-medium text-foreground/70 truncate max-w-[100px]">
                    {mov.cuenta?.nombre || 'Sin cuenta'}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">{formatDate(mov.fecha)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={`text-sm font-bold ${mov.tipo === "INGRESO" ? "text-[#008080]" : "text-destructive"}`}>
                {mov.tipo === "INGRESO" ? "+" : "-"} {formatCurrency(Number(mov.monto))}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(mov)}>
                    <Edit className="h-4 w-4 mr-2" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive font-medium" onClick={() => onDelete(mov)}>
                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}

        {movimientos.length === 0 && (
          <div className="text-center py-16 border rounded-xl border-dashed border-muted-foreground/20">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No hay transacciones registradas</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
