import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { Document, Page, pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent } from "@/shared/components/ui/card"
import { ArrowLeft, Download, Shield } from "lucide-react"

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString()

const DRIVE_DOWNLOAD_URL =
  "https://example.com/privacy-policy.pdf"

// Se excluyen portada y tabla de contenido.
// Si tu tabla de contenido ocupa más páginas, ajusta este número.
const FIRST_CONTENT_PAGE = 2

export function PrivacyPolicyPage() {
  const pdfUrl = useMemo(() => DRIVE_DOWNLOAD_URL, [])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [numPages, setNumPages] = useState<number | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      const width = Math.floor(entry?.contentRect?.width ?? 0)
      setContainerWidth(width)
    })

    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const pageWidth = Math.min(containerWidth || 0, 900)
  const pagesToRender = useMemo(() => {
    if (!numPages) return []
    const start = Math.min(Math.max(FIRST_CONTENT_PAGE, 1), numPages)
    return Array.from({ length: numPages - start + 1 }, (_, idx) => start + idx)
  }, [numPages])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-3 w-fit">
            <img
              src="/logo.png"
              alt="Logo de la app"
              className="w-10 h-10 object-contain dark:hidden"
            />
            <img
              src="/logo.png"
              alt="Logo de la app"
              className="w-10 h-10 object-contain hidden dark:block"
            />
            <div>
              <h2 className="font-bold text-xl">Finanzas App</h2>
              <p className="text-xs text-muted-foreground">Plantilla base</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Política de Tratamiento de Datos Personales</h1>
            <p className="text-muted-foreground text-lg">Finanzas App</p>
          </div>

          {/* Intro + Descarga */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground leading-relaxed">
                  A continuación puedes leer el documento completo o descargarlo.
                </p>
                <Button asChild className="sm:w-auto">
                  <a href={DRIVE_DOWNLOAD_URL} target="_blank" rel="noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Documento (renderizado desde página 3) */}
          <Card>
            <CardContent className="pt-6">
              <div ref={containerRef} className="w-full">
                <div className="rounded-lg border bg-muted/20 p-3 sm:p-4">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={({ numPages: total }) => setNumPages(total)}
                    loading={<p className="text-sm text-muted-foreground">Cargando documento…</p>}
                    error={
                      <div className="space-y-2">
                        <p className="text-sm text-destructive">No se pudo cargar el documento.</p>
                        <p className="text-sm text-muted-foreground">
                          Puedes descargarlo desde{" "}
                          <a className="underline" href={DRIVE_DOWNLOAD_URL} target="_blank" rel="noreferrer">
                            este enlace
                          </a>
                          .
                        </p>
                      </div>
                    }
                  >
                    <div className="space-y-6">
                      {pagesToRender.map((pageNumber) => (
                        <div key={pageNumber} className="flex justify-center">
                          <div className="rounded-md bg-background shadow-sm ring-1 ring-border overflow-hidden">
                            <Page
                              pageNumber={pageNumber}
                              width={pageWidth || undefined}
                              renderTextLayer
                              renderAnnotationLayer
                              loading={<div className="p-6 text-sm text-muted-foreground">Cargando página…</div>}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Document>
                </div>

                {numPages && numPages >= FIRST_CONTENT_PAGE && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Mostrando páginas {FIRST_CONTENT_PAGE}–{numPages} (portada y tabla de contenido excluidas).
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/login" className="flex-1">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Iniciar Sesión
              </Button>
            </Link>
            <Link to="/" className="flex-1">
              <Button className="w-full">
                Ir al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

