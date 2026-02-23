import { Youtube, Facebook, Instagram, Globe } from "lucide-react"

export function MeetingsSection() {
  const meetings = [
    { day: "Registro de transacciones", description: "Crea gastos e ingresos en segundos con categorías claras." },
    { day: "Presupuestos por categoría", description: "Define límites mensuales y monitorea tu progreso." },
    { day: "Metas de ahorro", description: "Planifica objetivos y revisa cuánto te falta para cumplirlos." },
    { day: "Reportes automáticos", description: "Analiza tendencias con métricas clave y panel visual." },
    { day: "Alertas inteligentes", description: "Recibe avisos cuando superes límites o detectes anomalías." },
  ]

  const socialLinks = [
    { icon: Globe, label: "finanzas-app.com", href: "https://finanzas-app.com" },
    { icon: Youtube, label: "Canal de Finanzas App", href: "https://www.youtube.com" },
    { icon: Facebook, label: "@finanzasapp", href: "https://www.facebook.com" },
    { icon: Instagram, label: "@finanzas.app", href: "https://www.instagram.com" },
  ]

  return (
    <section id="horarios" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-10 left-10 w-72 h-72 opacity-5 pointer-events-none -rotate-45">
        <img src="/placeholder.svg" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="absolute bottom-10 right-10 w-96 h-96 opacity-5 pointer-events-none rotate-90">
        <img src="/placeholder.svg" alt="" className="w-full h-full object-contain" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Nuestras <span className="text-primary">funciones</span>
          </h2>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Circular Image with curved border */}
            <div className="relative animate-in fade-in slide-in-from-left">
              <div className="relative w-full aspect-square max-w-md mx-auto">
                {/* Curved green border accent */}
                <div className="absolute inset-0 rounded-full border-8 border-primary/20" />
                <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full border-8 border-primary" />

                {/* Circular image */}
                <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl">
                  <img
                    src="/images/hero-background2.jpeg"
                    alt="Funciones de la aplicación"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                </div>
              </div>
            </div>

            {/* Right: Schedule Table */}
            <div className="animate-in fade-in slide-in-from-right">
              <div className="bg-background rounded-2xl shadow-lg p-8 border border-border">
                <div className="space-y-6">
                  {meetings.map((meeting, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-6 pb-6 border-b border-border last:border-b-0 last:pb-0 hover:translate-x-2 transition-transform duration-300"
                    >
                      <div className="flex shrink-0 w-1 h-16 bg-primary rounded-full" />
                      <div className="flex-1 space-y-1">
                        <h3 className="text-lg font-bold text-foreground">{meeting.day}</h3>
                        <p className="text-muted-foreground">{meeting.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6">
            <a
              href={socialLinks[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
            >
              <Globe className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{socialLinks[0].label}</span>
            </a>
            <a
              href={socialLinks[1].href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-[#FF0000] transition-colors group"
            >
              <Youtube className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{socialLinks[1].label}</span>
            </a>
            <a
              href={socialLinks[2].href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-[#1877F2] transition-colors group"
            >
              <Facebook className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{socialLinks[2].label}</span>
            </a>
            <a
              href={socialLinks[3].href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-[#E4405F] transition-colors group"
            >
              <Instagram className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">{socialLinks[3].label}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
