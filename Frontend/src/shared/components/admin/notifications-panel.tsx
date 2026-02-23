import { Bell, CheckCheck, Trash2, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { useNotifications } from "@/shared/contexts/notifications-context"
import { cn } from "@/shared/lib/utils"

const typeStyles = {
  info: "outline",
  success: "default",
  warning: "secondary",
  error: "destructive",
} as const

export function NotificationsPanel() {
  const {
    notifications,
    unreadCount,
    socketConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useNotifications()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative shrink-0">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] leading-5 text-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[380px] p-0" align="end">
        <DropdownMenuLabel className="flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-2">
            <span>Notificaciones</span>
            <Badge variant={socketConnected ? "default" : "secondary"} className="text-[10px]">
              {socketConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
              {socketConnected ? "socket activo" : "socket inactivo"}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" title="Marcar todo leído" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" title="Limpiar notificaciones" onClick={clearNotifications}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No hay notificaciones todavía.</div>
        ) : (
          <ScrollArea className="h-[360px]">
            <div className="p-2 space-y-2">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markAsRead(notification.id)}
                  className={cn(
                    "w-full text-left rounded-md border p-3 transition-colors hover:bg-accent",
                    !notification.read && "border-primary/40 bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <Badge variant={typeStyles[notification.type]}>{notification.type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    {new Date(notification.createdAt).toLocaleString("es-CO")}
                  </p>
                </button>
              ))}
            </div>
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

