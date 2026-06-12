import { useState, useEffect, useMemo } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Badge } from "@/shared/components/ui/badge"
import { Label } from "@/shared/components/ui/label"
import { Spinner } from "@/shared/components/ui/spinner"
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Scale, 
  Search 
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { toast } from "sonner"

import { dashboardService } from "../services/dashboard.service"
import type { DashboardSummary, DashboardFilters } from "../types"

// Helpers
function formatCurrency(value: string | number) {
  const num = Number(value);
  if (isNaN(num)) return "$0";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(num);
}

function formatDate(dateStr: string) {
  try {
    return format(new Date(dateStr), "dd MMM yyyy", { locale: es });
  } catch {
    return dateStr;
  }
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Filtros de Fecha (por defecto, mes actual)
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

  const [fechaInicio, setFechaInicio] = useState(format(primerDiaMes, "yyyy-MM-dd"))
  const [fechaFin, setFechaFin] = useState(format(ultimoDiaMes, "yyyy-MM-dd"))

  // Hydration state for Recharts
  const [mounted, setMounted] = useState(false)

  const loadDashboard = async (filters?: DashboardFilters) => {
    setIsLoading(true)
    try {
      const summary = await dashboardService.getSummary(filters)
      setData(summary)
    } catch (error) {
      console.error("Error al cargar dashboard", error)
      toast.error("No se pudo obtener la información del dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setMounted(true)
    loadDashboard({ fecha_inicio: fechaInicio, fecha_fin: fechaFin })
  }, [])

  const handleFiltrar = () => {
    if (!fechaInicio || !fechaFin) {
      toast.error("Por favor selecciona ambas fechas")
      return
    }
    loadDashboard({ fecha_inicio: fechaInicio, fecha_fin: fechaFin })
  }

  // Agrupar historial de movimientos por día para el gráfico
  const chartData = useMemo(() => {
    if (!data?.historial_movimientos) return [];

    const map = new Map<string, { fechaStr: string; ingresos: number; gastos: number }>();

    data.historial_movimientos.forEach(mov => {
      // Tomamos solo la parte YYYY-MM-DD para la llave
      const dateKey = mov.fecha.split("T")[0];
      const montoNum = Number(mov.monto);
      
      if (!map.has(dateKey)) {
        map.set(dateKey, { 
          fechaStr: formatDate(mov.fecha), 
          ingresos: 0, 
          gastos: 0 
        });
      }

      const dia = map.get(dateKey)!;
      if (mov.tipo === "ingreso") {
        dia.ingresos += montoNum;
      } else {
        dia.gastos += montoNum;
      }
    });

    // Convertir el Map a Array y ordenarlo por fecha (alfabético con la key YYYY-MM-DD funciona)
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([_, val]) => ({
        fecha: val.fechaStr,
        Ingresos: val.ingresos,
        Gastos: val.gastos
      }));

  }, [data?.historial_movimientos])

  if (isLoading && !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Spinner className="h-8 w-8 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Calculando métricas...
        </p>
      </div>
    )
  }

  const resumen = data?.resumen;
  const movimientos = data?.historial_movimientos || [];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8">
      {/* Encabezado y Filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Mi Rendimiento Financiero
          </h1>
          <p className="text-muted-foreground text-sm">
            Visualiza y compara tus ingresos frente a tus gastos.
          </p>
        </div>
        
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="fecha_inicio" className="text-xs">Fecha Inicio</Label>
            <Input 
              id="fecha_inicio" 
              type="date" 
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="fecha_fin" className="text-xs">Fecha Fin</Label>
            <Input 
              id="fecha_fin" 
              type="date" 
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="h-9"
            />
          </div>
          <Button onClick={handleFiltrar} size="sm" className="h-9" disabled={isLoading}>
            {isLoading ? <Spinner className="h-4 w-4 mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Filtrar
          </Button>
        </div>
      </div>

      {/* Grid de Resumen Superior */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Consolidado</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(resumen?.total_saldo || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Suma de todas tus cuentas</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos del Período</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{formatCurrency(resumen?.total_ingresos || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Capital entrante</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gastos del Período</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(resumen?.total_gastos || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Consumo registrado</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance (Ingresos - Gastos)</CardTitle>
            <Scale className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${Number(resumen?.balance_periodo) >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(resumen?.balance_periodo || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Resultado neto del período</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico y Lista */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Gráfico */}
        <Card className="shadow-sm lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Tendencia Diaria</CardTitle>
            <CardDescription>Comparativa de Ingresos vs Gastos día a día</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[350px] pl-0">
            {mounted && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis 
                    dataKey="fecha" 
                    className="text-xs fill-muted-foreground" 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    className="text-xs fill-muted-foreground" 
                    width={80} 
                    tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)} 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Ingresos" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorIngresos)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Gastos" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorGastos)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                No hay datos suficientes para graficar en este período.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Historial Reciente */}
        <Card className="shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Historial del Período</CardTitle>
            <CardDescription>Transacciones de la fecha seleccionada</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto max-h-[400px] pr-2 space-y-3">
            {movimientos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Sin transacciones registradas.
              </p>
            ) : (
              movimientos.map((mov) => (
                <div key={String(mov.id)} className="flex items-center justify-between p-3 rounded-xl border bg-card/50 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      mov.tipo === "ingreso" ? "bg-accent/10 text-accent" : "bg-destructive/10 text-destructive"
                    }`}>
                      {mov.tipo === "ingreso" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{mov.descripcion}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-[10px] px-1.5 font-normal">
                          {mov.categoria || "General"}
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate">
                          {formatDate(mov.fecha)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`font-bold text-sm shrink-0 whitespace-nowrap ml-2 ${mov.tipo === "ingreso" ? "text-accent" : "text-destructive"}`}>
                    {mov.tipo === "ingreso" ? "+" : "-"}{formatCurrency(mov.monto)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
