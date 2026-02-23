import { Link, useNavigate } from "react-router-dom"
import { useTheme } from "@/shared/contexts/theme-provider"
import { useAuth } from "@/shared/contexts/auth-context"
import { LogIn, LayoutDashboard, User } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { useState } from "react"

export function Footer() {
  const { resolvedTheme } = useTheme()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [isLegalPersonDialogOpen, setIsLegalPersonDialogOpen] = useState(false)

  const navigationLinks = [
    { to: "#inicio", label: "Inicio" },
    { to: "#quienes-somos", label: "Sobre nosotros" },
    { to: "#horarios", label: "Funciones" },
    { to: "#predicas", label: "Recursos" },
    { to: "#contactenos", label: "Contacto" },
  ]

  const legalLinks = [
    { to: "/privacy-policy", label: "Política de privacidad y tratamiento de datos" },
    { to: "", label: "Información legal" },
  ]

  const appLogoSrc = resolvedTheme === "dark" ? "/logo.png" : "/logo.png"

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const target = document.querySelector(targetId)
    if (target) {
      const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
    }
  }

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Sección 1: Logo */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-4">
              <div className="flex flex-row items-center">
                <img
                  src={appLogoSrc || "/placeholder.svg"}
                  alt="Logo de la app"
                  className="w-16 h-16 object-contain mr-2 transition-all duration-300"
                />
                <span className="text-xs font-semibold text-start  leading-tight">
                  FINANZAS <br /> APP
                </span>
              </div>
            </div>
          </div>

          {/* Sección 2: Navegación */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Navegación</h3>
            <nav className="space-y-2">
              {navigationLinks.map((link) => (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={(e) => handleNavClick(e, link.to)}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Sección 3: Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Legal</h3>
            <nav className="space-y-2">
              {legalLinks.map((link) => (
                link.label === "Información legal" ? (
                  <button
                    key={link.label}
                    onClick={() => setIsLegalPersonDialogOpen(true)}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors text-left w-full"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </nav>
          </div>

          {/* Sección 4: Acceso */}
          <div>
            <h3 className="font-semibold text-sm mb-4">
              {isAuthenticated ? "Mi Cuenta" : "Acceso"}
            </h3>
            
            {isAuthenticated ? (
              <div className="space-y-3">
                <Button 
                  variant="default" 
                  className="w-full md:w-auto"
                  onClick={() => navigate("/admin")}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Panel Admin
                </Button>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Rol: <span className="font-medium">{user?.role.name}</span>
                </p>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="w-full md:w-auto">
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-4">
                  Accede al panel administrativo de la aplicación
                </p>
              </>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © 2025 Finanzas App. Todos los derechos reservados.
            </p>
            <p className="text-xs text-muted-foreground">
              Versión 3.5.0
            </p>
          </div>
        </div>
      </div>

      {/* Diálogo de información legal */}
      <Dialog open={isLegalPersonDialogOpen} onOpenChange={setIsLegalPersonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Información legal</DialogTitle>
            <DialogDescription>
              Para solicitudes legales o corporativas, contáctanos en:{" "}
              <a 
                href="mailto:legal@finanzas-app.com" 
                className="text-primary hover:underline font-medium"
              >
                legal@finanzas-app.com
              </a>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </footer>
  )
}
