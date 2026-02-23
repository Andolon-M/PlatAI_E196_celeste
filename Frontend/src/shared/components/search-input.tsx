import { useState, useEffect, useRef } from "react"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/lib/utils"

interface SearchInputProps {
  /** Callback que se ejecuta después del debounce con el término de búsqueda */
  onSearch: (query: string) => void
  /** Placeholder del input */
  placeholder?: string
  /** Tiempo de espera en milisegundos antes de ejecutar la búsqueda (default: 1000ms) */
  debounceMs?: number
  /** Indica visualmente que se está realizando una búsqueda */
  isSearching?: boolean
  /** Clases CSS adicionales para el contenedor */
  className?: string
  /** Valor inicial del input */
  defaultValue?: string
}

/**
 * Componente de búsqueda con debounce integrado.
 * 
 * Espera un tiempo configurable después de que el usuario deja de escribir
 * antes de ejecutar la búsqueda, evitando peticiones innecesarias al backend.
 * 
 * @example
 * ```tsx
 * <SearchInput
 *   onSearch={(query) => setSearchQuery(query)}
 *   placeholder="Buscar usuarios..."
 *   isSearching={isLoading}
 * />
 * ```
 */
export function SearchInput({
  onSearch,
  placeholder = "Buscar...",
  debounceMs = 1000,
  isSearching = false,
  className,
  defaultValue = "",
}: SearchInputProps) {
  const [inputValue, setInputValue] = useState(defaultValue)
  const [isDebouncing, setIsDebouncing] = useState(false)
  
  // Usar ref para mantener onSearch actualizado sin causar re-ejecuciones del useEffect
  const onSearchRef = useRef(onSearch)
  onSearchRef.current = onSearch

  useEffect(() => {
    // Si el input está vacío, ejecutar búsqueda inmediatamente
    if (inputValue.trim() === "") {
      onSearchRef.current("")
      setIsDebouncing(false)
      return
    }

    // Indicar que estamos esperando el debounce
    setIsDebouncing(true)

    // Esperar el tiempo configurado antes de ejecutar la búsqueda
    const timer = setTimeout(() => {
      onSearchRef.current(inputValue)
      setIsDebouncing(false)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [inputValue, debounceMs])

  return (
    <div className={cn("relative", className)}>
      {/* Icono de búsqueda o loader */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        {isDebouncing || isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      {/* Input de búsqueda */}
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-10"
      />
    </div>
  )
}

