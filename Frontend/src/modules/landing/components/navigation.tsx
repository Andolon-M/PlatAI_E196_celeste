import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Menu, X, LogIn, LayoutDashboard, User } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { ThemeToggle } from "@/shared/components/theme-toggle"
import { useTheme } from "@/shared/contexts/theme-provider"
import { useAuth } from "@/shared/contexts/auth-context"

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault()
    const target = document.querySelector(targetId)
    if (target) {
      const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80 // 80px offset for navbar
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      })
      setIsMobileMenuOpen(false)
    }
  }

  const navLinks = [
    { to: "#inicio", label: "Inicio" },
    { to: "#horarios", label: "Funciones" },
    { to: "#quienes-somos", label: "Sobre nosotros" },
    { to: "#contactenos", label: "Contacto" },
  ]

  const logoSrc =
    resolvedTheme === "dark"
      ? "/logo.png"
      : isScrolled
        ? "/logo.png"
        : "/logo.png"
  const textColor = resolvedTheme === "dark" ? "text-white" : isScrolled ? "text-foreground" : "text-white"
  const subtextColor = resolvedTheme === "dark" ? "text-white/80" : isScrolled ? "text-muted-foreground" : "text-white/80"

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-md" : "bg-transparent backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="#inicio" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 transition-transform group-hover:scale-105">
              <img src={logoSrc || "/placeholder.svg"} alt="Logo de la app" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-lg leading-tight ${textColor}`}>FINANZAS APP</span>
              <span className={`text-xs ${subtextColor}`}>Control inteligente de tu dinero</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <a
                key={link.to}
                href={link.to}
                onClick={(e) => handleNavClick(e, link.to)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:bg-primary hover:text-primary-foreground ${
                  resolvedTheme === "dark" ? "text-white" : isScrolled ? "text-foreground" : "text-white"
                } ${link.to === "#inicio" ? "bg-primary text-primary-foreground" : ""}`}
              >
                {link.label}
              </a>
            ))}
            {isAuthenticated ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/admin")}
                  className={
                    resolvedTheme === "dark" || !isScrolled
                      ? "border-white text-white hover:bg-white/10"
                      : ""
                  }
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Panel Admin
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className={
                    resolvedTheme === "dark" || !isScrolled
                      ? "text-white hover:bg-white/10"
                      : ""
                  }
                >
                  <User className="h-4 w-4 mr-2" />
                  <span className="max-w-[100px] truncate">{user?.email.split("@")[0]}</span>
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button
                  size="sm"
                  className={
                    resolvedTheme === "dark" || !isScrolled
                      ? "bg-white text-primary hover:bg-white/90"
                      : ""
                  }
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Iniciar Sesión
                </Button>
              </Link>
            )}
            <div
              className={
                resolvedTheme === "dark"
                  ? "[&_button]:text-white [&_button]:hover:bg-white/10"
                  : isScrolled
                    ? ""
                    : "[&_button]:text-white [&_button]:hover:bg-white/10"
              }
            >
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <div
              className={
                resolvedTheme === "dark"
                  ? "[&_button]:text-white [&_button]:hover:bg-white/10"
                  : isScrolled
                    ? ""
                    : "[&_button]:text-white [&_button]:hover:bg-white/10"
              }
            >
              <ThemeToggle />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? (
                <X className={resolvedTheme === "dark" ? "text-white" : isScrolled ? "text-foreground" : "text-white"} />
              ) : (
                <Menu className={resolvedTheme === "dark" ? "text-white" : isScrolled ? "text-foreground" : "text-white"} />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 animate-in slide-in-from-top">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.to}
                  href={link.to}
                  onClick={(e) => handleNavClick(e, link.to)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all hover:bg-primary hover:text-primary-foreground ${
                    link.to === "#inicio" ? "bg-primary text-primary-foreground" : "bg-card"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              {isAuthenticated ? (
                <>
                  <Button 
                    className="w-full" 
                    size="sm"
                    onClick={() => {
                      navigate("/admin")
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Panel Admin
                  </Button>
                  <Button 
                    className="w-full" 
                    size="sm"
                    variant="outline"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user?.email.split("@")[0]}
                  </Button>
                </>
              ) : (
                <Link to="/login" className="w-full">
                  <Button className="w-full" size="sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    Iniciar Sesión
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
