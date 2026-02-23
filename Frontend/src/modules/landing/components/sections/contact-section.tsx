import { Card } from "@/shared/components/ui/card"
import { Button } from "@/shared/components/ui/button"
import { Mail, MessageCircle, Youtube, Facebook, Instagram, MapPin } from "lucide-react"

export function ContactSection() {
  const whatsappNumber = "573118533831"
  const whatsappMessage = "Hola, me gustaría obtener más información sobre la aplicación."
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
  
  const socialLinks = {
    youtube: "https://www.youtube.com",
    facebook: "https://www.facebook.com",
    instagram: "https://www.instagram.com"
  }
  
  // Dirección codificada para Google Maps
  const address = "Cra 12 #14 Norte - 66 Piso 2 Kennedy, Bucaramanga, Colombia"
  const googleMapsUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(address)}`

  return (
    <section id="contactenos" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Contáctenos</h2>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left: Google Map */}
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-left">
              <div className="relative aspect-square bg-muted">
                <iframe
                  src={googleMapsUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación de la oficina"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg p-4 shadow-lg border">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-sm">Cra 12 #14 Norte - 66 Piso 2 Kennedy</p>
                      <p className="text-sm text-muted-foreground">Bucaramanga, Colombia</p>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                      >
                        Ver en Google Maps →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Right: Contact Info */}
            <div className="space-y-8 animate-in fade-in slide-in-from-right">
              {/* Email */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <a
                      href="mailto:contactenos@myApp.com"
                      className="text-lg font-semibold hover:text-primary transition-colors"
                    >
                      contactenos@myApp.com
                    </a>
                  </div>
                </div>
              </Card>

              {/* WhatsApp */}
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-[#25D366]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">WhatsApp</p>
                      <p className="text-lg font-semibold">+57 311 853 3831</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => window.open(whatsappUrl, '_blank')}
                    className="bg-[#25D366] hover:bg-[#25D366]/90 text-white"
                  >
                    Chatear
                  </Button>
                </div>
              </Card>

              {/* Social Media */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Síguenos en redes sociales</h3>
                <div className="flex gap-4">
                  <a
                    href={socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-muted hover:bg-[#FF0000]/10 flex items-center justify-center transition-all hover:scale-110 group"
                    aria-label="YouTube"
                  >
                    <Youtube className="h-5 w-5 text-muted-foreground group-hover:text-[#FF0000] transition-colors" />
                  </a>
                  <a
                    href={socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-muted hover:bg-[#1877F2]/10 flex items-center justify-center transition-all hover:scale-110 group"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5 text-muted-foreground group-hover:text-[#1877F2] transition-colors" />
                  </a>
                  <a
                    href={socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-muted hover:bg-[#E4405F]/10 flex items-center justify-center transition-all hover:scale-110 group"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5 text-muted-foreground group-hover:text-[#E4405F] transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
