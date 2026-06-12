import { Card, CardContent } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { 
  MoreVertical, Edit, Trash2, Tag, ArrowUpRight, ArrowDownRight, ArrowRightLeft,
  Coffee, ShoppingBag, Home, Zap, Car, Bus, Plane, Smartphone, Monitor, Book,
  HeartPulse, Utensils, Music, GraduationCap, Briefcase, Gift, DollarSign
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { Badge } from "@/shared/components/ui/badge"
import type { Category } from "../types"

interface CategoryCardProps {
  category: Category;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}

// Icon mapper (the same icons we will provide in the form)
const iconMapper: Record<string, any> = {
  "Tag": Tag,
  "Coffee": Coffee,
  "ShoppingBag": ShoppingBag,
  "Home": Home,
  "Zap": Zap,
  "Car": Car,
  "Bus": Bus,
  "Plane": Plane,
  "Smartphone": Smartphone,
  "Monitor": Monitor,
  "Book": Book,
  "HeartPulse": HeartPulse,
  "Utensils": Utensils,
  "Music": Music,
  "GraduationCap": GraduationCap,
  "Briefcase": Briefcase,
  "Gift": Gift,
  "DollarSign": DollarSign
};

export function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const IconComponent = category.icono && iconMapper[category.icono] ? iconMapper[category.icono] : Tag;

  const typeConfig = {
    "INGRESO": { color: "text-[#008080]", bg: "bg-[#008080]/10", label: "Ingreso", Icon: ArrowUpRight },
    "GASTO": { color: "text-destructive", bg: "bg-destructive/10", label: "Gasto", Icon: ArrowDownRight },
    "AMBOS": { color: "text-blue-600", bg: "bg-blue-600/10", label: "Ambos", Icon: ArrowRightLeft }
  };
  const typeStyle = typeConfig[category.tipo as keyof typeof typeConfig] || typeConfig["GASTO"];
  const TypeIcon = typeStyle.Icon;

  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardContent className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
            style={{ backgroundColor: category.color || '#e5e7eb' }}
          >
            <IconComponent className="h-6 w-6 text-white drop-shadow-sm" />
          </div>
          
          <div>
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">{category.nombre}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeStyle.bg} ${typeStyle.color}`}>
                <TypeIcon className="h-3 w-3" />
                {typeStyle.label}
              </div>
            </div>
          </div>
        </div>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <Edit className="h-4 w-4 mr-2" /> Editar Categoría
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => onDelete(category)}>
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
