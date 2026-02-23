import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Shield, Plus, Key } from "lucide-react"
import type { Role } from "../types"

const mockRoles: Role[] = [
  { id: "1", name: "Administrador", permissions: [], created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "2", name: "Pastor", permissions: [], created_at: "2024-01-01", updated_at: "2024-01-01" },
  { id: "3", name: "Líder de Ministerio", permissions: [], created_at: "2024-01-15", updated_at: "2024-01-15" },
  { id: "4", name: "Miembro", permissions: [], created_at: "2024-01-01", updated_at: "2024-01-01" },
]

export function RolesPage() {
  const [roles] = useState<Role[]>(mockRoles)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Roles y Permisos</h1>
          <p className="text-muted-foreground">Gestiona los roles y permisos del sistema</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Rol
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                </div>
              </div>
              <CardDescription>Creado: {role.created_at}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span>Permisos</span>
                </div>
                <Badge variant="secondary">{role.permissions.length}</Badge>
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Permisos
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Editar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

