import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { useNotifications } from "@/shared/contexts/notifications-context"
import { Users, UserCircle, Calendar, DollarSign, TrendingUp, TrendingDown } from "lucide-react"

export function AdminDashboard() {
  const { notifications } = useNotifications()
  const recentNotifications = notifications.slice(0, 6)

  const stats = [
    {
      title: "Total Usuarios",
      value: "156",
      change: "+12%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Cuentas Activas",
      value: "342",
      change: "+8%",
      trend: "up",
      icon: UserCircle,
    },
    {
      title: "Metas Este Mes",
      value: "24",
      change: "+3",
      trend: "up",
      icon: Calendar,
    },
    {
      title: "Ingresos Mensuales",
      value: "$12,450",
      change: "-5%",
      trend: "down",
      icon: DollarSign,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al panel administrativo de la aplicación</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs flex items-center gap-1 ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}
                >
                  <TrendIcon className="h-3 w-3" />
                  {stat.change} desde el mes pasado
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones de mensajería</CardTitle>
            <CardDescription>Eventos recientes de campañas masivas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentNotifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay notificaciones recientes.</p>
              ) : (
                recentNotifications.map((notification) => (
                  <div key={notification.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <Badge variant="outline">{notification.event}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleString("es-CO")}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas actividades</CardTitle>
            <CardDescription>Tareas financieras programadas esta semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Revisión de presupuesto", date: "Dom, 26 Ene", time: "9:00 AM" },
                { name: "Cierre de gastos semanales", date: "Mié, 29 Ene", time: "7:00 PM" },
                { name: "Actualización de metas", date: "Sáb, 1 Feb", time: "6:00 PM" },
              ].map((event, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{event.name}</p>
                    <p className="text-xs text-muted-foreground">{event.date}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{event.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

