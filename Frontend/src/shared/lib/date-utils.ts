/**
 * Utilidades para formatear y manipular fechas
 * Maneja correctamente las fechas que vienen del backend en formato UTC
 * evitando problemas de conversión de zona horaria
 */

/**
 * Extrae solo la parte de la fecha (YYYY-MM-DD) de una cadena de fecha ISO
 * Útil para evitar problemas de zona horaria cuando solo necesitamos la fecha
 * 
 * @param dateString - Fecha en formato ISO (ej: "2000-08-06T00:00:00.000Z")
 * @returns Fecha en formato YYYY-MM-DD (ej: "2000-08-06")
 */
export function extractDateOnly(dateString: string): string {
  if (!dateString) return ""
  return dateString.split('T')[0]
}

/**
 * Parsea una fecha ISO y retorna los componentes (año, mes, día) en UTC
 * Evita problemas de zona horaria al trabajar solo con fechas
 * 
 * @param dateString - Fecha en formato ISO (ej: "2000-08-06T00:00:00.000Z")
 * @returns Objeto con año, mes (1-12) y día
 */
export function parseDateUTC(dateString: string): { year: number; month: number; day: number } | null {
  try {
    const dateOnly = extractDateOnly(dateString)
    if (!dateOnly) return null
    
    const [year, month, day] = dateOnly.split('-').map(Number)
    return { year, month, day }
  } catch {
    return null
  }
}

/**
 * Formatea una fecha en formato largo (ej: "6 de agosto de 2000")
 * Maneja correctamente las fechas UTC del backend
 * 
 * @param dateString - Fecha en formato ISO (ej: "2000-08-06T00:00:00.000Z")
 * @param locale - Locale para formatear (default: "es-CO")
 * @returns Fecha formateada (ej: "6 de agosto de 2000")
 */
export function formatDateLong(dateString: string, locale: string = "es-CO"): string {
  try {
    const parsed = parseDateUTC(dateString)
    if (!parsed) return dateString
    
    const { year, month, day } = parsed
    
    // Crear fecha usando UTC para evitar conversión de zona horaria
    const date = new Date(Date.UTC(year, month - 1, day))
    
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC", // Forzar UTC para mantener la fecha correcta
    })
  } catch {
    return dateString
  }
}

/**
 * Formatea una fecha en formato corto (ej: "6 ago 2000")
 * Maneja correctamente las fechas UTC del backend
 * 
 * @param dateString - Fecha en formato ISO (ej: "2000-08-06T00:00:00.000Z")
 * @param locale - Locale para formatear (default: "es-CO")
 * @returns Fecha formateada (ej: "6 ago 2000")
 */
export function formatDateShort(dateString: string, locale: string = "es-CO"): string {
  try {
    const parsed = parseDateUTC(dateString)
    if (!parsed) return dateString
    
    const { year, month, day } = parsed
    
    // Crear fecha usando UTC para evitar conversión de zona horaria
    const date = new Date(Date.UTC(year, month - 1, day))
    
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })
  } catch {
    return dateString
  }
}

/**
 * Formatea una fecha en formato numérico (ej: "06/08/2000")
 * Maneja correctamente las fechas UTC del backend
 * 
 * @param dateString - Fecha en formato ISO (ej: "2000-08-06T00:00:00.000Z")
 * @param locale - Locale para formatear (default: "es-CO")
 * @returns Fecha formateada (ej: "06/08/2000")
 */
export function formatDateNumeric(dateString: string, locale: string = "es-CO"): string {
  try {
    const parsed = parseDateUTC(dateString)
    if (!parsed) return dateString
    
    const { year, month, day } = parsed
    
    // Crear fecha usando UTC para evitar conversión de zona horaria
    const date = new Date(Date.UTC(year, month - 1, day))
    
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    })
  } catch {
    return dateString
  }
}

/**
 * Calcula la edad basándose en una fecha de nacimiento
 * Maneja correctamente las fechas UTC del backend
 * 
 * @param birthdate - Fecha de nacimiento en formato ISO (ej: "2000-08-06T00:00:00.000Z")
 * @returns Edad en años
 */
export function calculateAge(birthdate: string): number {
  try {
    const parsed = parseDateUTC(birthdate)
    if (!parsed) return 0
    
    const { year, month, day } = parsed
    
    // Crear fechas usando UTC
    const today = new Date()
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
    const birthUTC = new Date(Date.UTC(year, month - 1, day))
    
    let age = todayUTC.getFullYear() - birthUTC.getFullYear()
    const monthDiff = todayUTC.getMonth() - birthUTC.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && todayUTC.getDate() < birthUTC.getDate())) {
      age--
    }
    
    return age
  } catch {
    return 0
  }
}

/**
 * Convierte una fecha ISO a formato YYYY-MM-DD para inputs de tipo date
 * Útil para prellenar campos de fecha en formularios
 * 
 * @param dateString - Fecha en formato ISO (ej: "2000-08-06T00:00:00.000Z")
 * @returns Fecha en formato YYYY-MM-DD (ej: "2000-08-06")
 */
export function formatDateForInput(dateString: string): string {
  return extractDateOnly(dateString)
}

/**
 * Formatea hora de un string ISO (HH:MM)
 * 
 * @param dateString - Fecha en formato ISO (ej: "2026-02-02T10:00:00.000Z")
 * @returns Hora formateada (ej: "10:00")
 */
export function formatTimeFromISO(dateString: string): string {
  try {
    const date = new Date(dateString)
    const hours = date.getUTCHours().toString().padStart(2, "0")
    const minutes = date.getUTCMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  } catch {
    return ""
  }
}

/**
 * Obtiene el día de la semana abreviado (LUN, MAR, etc.)
 */
export function getDayOfWeekShort(date: Date, locale = "es-ES"): string {
  return date.toLocaleDateString(locale, { weekday: "short" }).toUpperCase().slice(0, 3)
}/**
 * Obtiene el mes abreviado (ene, feb, etc.)
 */
export function getMonthShort(date: Date, locale = "es-ES"): string {
  return date.toLocaleDateString(locale, { month: "short" }).toLowerCase()
}