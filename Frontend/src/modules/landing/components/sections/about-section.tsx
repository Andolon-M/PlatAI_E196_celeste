import { Card } from "@/shared/components/ui/card"

export function AboutSection() {
  return (
    <section id="quienes-somos" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-20 right-0 w-96 h-96 opacity-5 dark:opacity-10 pointer-events-none">
        <img src="/placeholder.svg" alt="" className="w-full h-full object-contain" />
      </div>
      <div className="absolute bottom-20 left-0 w-80 h-80 opacity-5 dark:opacity-10 pointer-events-none rotate-180">
        <img src="/placeholder.svg" alt="" className="w-full h-full object-contain" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Sobre <span className="text-primary">nosotros</span>
          </h2>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Quienes Somos */}
              <Card className="p-8 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left">
                <div className="flex items-start gap-4 mb-4">
                  <img src="/logo.png" alt="Logo de la app" className="w-20 h-20 object-contain" />
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Quienes somos</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Somos una plataforma digital enfocada en facilitar la gestión de finanzas personales.
                    </p>
                  </div>
                </div>
              </Card>

              {/* Nuestra Misión */}
              <Card className="p-8 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left delay-100">
                <h3 className="text-2xl font-bold mb-4">
                  Nuestra <span className="text-primary">Misión</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Ayudar a las personas a tomar mejores decisiones financieras con herramientas simples,
                  visuales claras y automatizaciones útiles para el día a día.
                </p>
              </Card>

              {/* Nuestra Visión */}
              <Card className="p-8 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left delay-200">
                <h3 className="text-2xl font-bold mb-4">
                  Nuestra <span className="text-primary">Visión</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Convertirnos en una base tecnológica confiable para construir apps modernas de finanzas
                  personales con foco en claridad, seguridad y crecimiento sostenible.
                </p>
              </Card>
            </div>

            {/* Right Column - Historia */}
            <Card className="p-8 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-right">
              <h3 className="text-2xl font-bold mb-4">
                Nuestro <span className="text-primary">enfoque</span>
              </h3>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Esta plantilla está diseñada para acelerar el inicio de productos financieros digitales.
                  Incluye una landing pública editable, autenticación y un panel administrativo listo para
                  evolucionar según las necesidades del negocio.
                </p>
                <p>
                  El objetivo es que puedas personalizar marca, contenido y módulos sin rehacer la estructura
                  principal, manteniendo una experiencia consistente para usuarios finales y administradores.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
