import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"

interface TransactionSummaryCardsProps {
  totalIngresos: number;
  totalGastos: number;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value)
}

export function TransactionSummaryCards({ totalIngresos, totalGastos }: TransactionSummaryCardsProps) {
  const balance = totalIngresos - totalGastos;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Ingresos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#008080]">{formatCurrency(totalIngresos)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Total Gastos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{formatCurrency(totalGastos)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Balance Neto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? "text-[#008080]" : "text-destructive"}`}>
            {formatCurrency(balance)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
