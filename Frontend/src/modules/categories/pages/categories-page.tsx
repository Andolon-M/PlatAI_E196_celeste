import { useState, useEffect } from "react"
import { Button } from "@/shared/components/ui/button"
import { Plus, Tags } from "lucide-react"
import { toast } from "sonner"
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

import type { Category, CreateCategoryDto, UpdateCategoryDto } from "../types"
import { categoriesService } from "../services/categories.service"

import { CategoryCard } from "../components/CategoryCard"
import { CategoryFormModal } from "../components/CategoryFormModal"
import { Spinner } from "@/shared/components/ui/spinner"

export function CategoriesPage() {
  const [categorias, setCategorias] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modales
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [catEdit, setCatEdit] = useState<Category | null>(null)
  const [catDelete, setCatDelete] = useState<Category | null>(null)

  useEffect(() => {
    cargarCategorias()
  }, [])

  const cargarCategorias = async () => {
    try {
      const data = await categoriesService.getCategories()
      setCategorias(data)
    } catch (error) {
      console.error(error)
      toast.error("Error al cargar categorías")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (data: CreateCategoryDto | UpdateCategoryDto) => {
    try {
      if (catEdit) {
        await categoriesService.updateCategory(catEdit.id, data as UpdateCategoryDto)
        toast.success("Categoría actualizada exitosamente")
      } else {
        await categoriesService.createCategory(data as CreateCategoryDto)
        toast.success("Categoría creada exitosamente")
      }
      cargarCategorias()
    } catch (error) {
      console.error(error)
      toast.error("Error al guardar la categoría")
    }
  }

  const handleDeleteConfirm = async () => {
    if (!catDelete) return
    try {
      await categoriesService.deleteCategory(catDelete.id)
      toast.success("Categoría eliminada exitosamente")
      setCatDelete(null)
      cargarCategorias()
    } catch (error) {
      console.error(error)
      toast.error("Error al eliminar la categoría. Asegúrate de que no tenga movimientos asociados.")
    }
  }

  const openNuevo = () => {
    setCatEdit(null)
    setIsFormOpen(true)
  }

  const openEdit = (cat: Category) => {
    setCatEdit(cat)
    setIsFormOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-3">
        <Spinner className="h-8 w-8 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Cargando catálogo...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Categorías</h2>
          <p className="text-sm text-muted-foreground">Personaliza tus rubros para clasificar transacciones</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-[#008080] hover:bg-[#006666] text-white" onClick={openNuevo}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categorias.map(cat => (
          <CategoryCard 
            key={cat.id} 
            category={cat}
            onEdit={openEdit}
            onDelete={setCatDelete}
          />
        ))}
      </div>

      {categorias.length === 0 && (
        <div className="text-center py-16 border rounded-xl bg-muted/10 border-dashed border-muted-foreground/20">
          <Tags className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-base font-semibold text-muted-foreground">No tienes categorías personalizadas</p>
          <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto mt-1">
            Crea categorías como "Salud", "Transporte" o "Salario" para organizar tus finanzas.
          </p>
        </div>
      )}

      {isFormOpen && (
        <CategoryFormModal
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          categoryEdit={catEdit}
          onSave={handleSave}
        />
      )}

      <AlertDialog open={!!catDelete} onOpenChange={(open) => !open && setCatDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar categoría?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar la categoría "{catDelete?.nombre}". 
              Ten en cuenta que esto podría no estar permitido si ya tienes movimientos financieros utilizando esta clasificación.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
