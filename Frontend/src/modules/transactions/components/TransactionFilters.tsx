import { Input } from "@/shared/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { Search, Filter } from "lucide-react"
import { Card, CardContent } from "@/shared/components/ui/card"
import type { Category } from "../types"

interface TransactionFiltersProps {
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  filtroCategoria: string;
  onFiltroCategoriaChange: (val: string) => void;
  categorias: Category[];
}

export function TransactionFilters({
  busqueda,
  onBusquedaChange,
  filtroCategoria,
  onFiltroCategoriaChange,
  categorias
}: TransactionFiltersProps) {
  
  // Categorías únicas
  const categoriasUnicas = Array.from(new Set(categorias.map(c => c.nombre)))

  return (
    <Card className="bg-muted/20">
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar movimientos por descripción..."
              value={busqueda}
              onChange={(e) => onBusquedaChange(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
          <Select value={filtroCategoria} onValueChange={onFiltroCategoriaChange}>
            <SelectTrigger className="w-full sm:w-[220px] bg-background">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las categorías</SelectItem>
              {categoriasUnicas.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
