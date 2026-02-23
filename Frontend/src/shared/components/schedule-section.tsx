import { Button } from "@/shared/components/ui/button"
import { Card } from "@/shared/components/ui/card"
import { Clock, Calendar } from "lucide-react"

export function ScheduleSection() {
  const schedules = [
    {
      day: "Domingos 9:00 am",
      description: "Servicio Dominical para toda la familia",
    },
    {
      day: "Miércoles 7:00 pm",
      description: "Servicio de oración",
    },
  ]

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-WDlQLkKRKxNYYV1WWG45tFcl5LMnpC.jpg"
          alt="Horarios"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/90 via-teal-800/85 to-teal-900/90" />
      </div>

      <div className="relative z-10 container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 mb-8 shadow-lg animate-in fade-in slide-in-from-left">
            <span className="text-primary font-bold text-lg">Bienvenidos</span>
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-12">Nuestros Horarios</h2>

          {/* Schedule Cards */}
          <div className="space-y-6 mb-8">
            {schedules.map((schedule, index) => (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-md border-white/20 p-6 hover:bg-white/15 transition-all duration-300 animate-in fade-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary rounded-lg">
                    <Clock className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{schedule.day}</h3>
                    <p className="text-white/90 text-lg">{schedule.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* More Schedule Button */}
          <Button
            size="lg"
            variant="outline"
            className="bg-live hover:bg-live/90 text-live-foreground border-live px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Más horarios
          </Button>
        </div>
      </div>
    </section>
  )
}
