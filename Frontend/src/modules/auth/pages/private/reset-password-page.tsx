import { useState, useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { AuthLayout } from "../../components/auth-layout"
import { Lock, Eye, EyeOff, CheckCircle, Loader2, XCircle } from "lucide-react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { authService } from "../../services/auth.service"
import { toast } from "sonner"
import type { ResetPasswordData } from "../../types"

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const params = useParams<{ token: string }>()
  
  // El token es obligatorio y viene del path
  const token = params.token || ""

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordReset, setPasswordReset] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifyingToken, setIsVerifyingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const [tokenErrorMessage, setTokenErrorMessage] = useState("")
  const [formData, setFormData] = useState<ResetPasswordData>({
    token,
    newPassword: "",
    confirmPassword: "",
  })

  // Verificar el token al cargar el componente
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false)
        setIsVerifyingToken(false)
        return
      }

      try {
        setIsVerifyingToken(true)
        const response = await authService.verifyToken(token)
        
        if (response.valid) {
          setTokenValid(true)
        } else {
          setTokenValid(false)
          setTokenErrorMessage(response.message || "Token inválido")
        }
      } catch (error) {
        console.error("Error al verificar token:", error)
        setTokenValid(false)
        setTokenErrorMessage("Error al verificar el token")
      } finally {
        setIsVerifyingToken(false)
      }
    }

    verifyToken()
  }, [token])

  // Mostrar loader mientras se verifica el token
  if (isVerifyingToken) {
    return (
      <AuthLayout
        title="Verificando Enlace"
        subtitle="Por favor espera un momento"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Verificando el enlace de restablecimiento...</p>
        </div>
      </AuthLayout>
    )
  }

  // Validar que el token es válido
  if (!token || tokenValid === false) {
    return (
      <AuthLayout
        title="Token Inválido"
        subtitle="El enlace de restablecimiento no es válido"
      >
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Enlace Inválido</h3>
                <p className="text-sm text-muted-foreground">
                  {tokenErrorMessage || "El enlace de restablecimiento de contraseña no es válido o ha expirado."}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Por favor, solicita un nuevo enlace.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={() => navigate("/forgot-password")} className="w-full">
          Solicitar Nuevo Enlace
        </Button>
      </AuthLayout>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)
    
    try {
      await authService.resetPassword(formData)
      setPasswordReset(true)
    } catch (error) {
      console.error("Error al restablecer contraseña:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (passwordReset) {
    return (
      <AuthLayout
        title="Contraseña Restablecida"
        subtitle="Tu contraseña ha sido actualizada exitosamente"
      >
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">¡Contraseña Actualizada!</h3>
                <p className="text-sm text-muted-foreground">
                  Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={() => navigate("/login")} className="w-full">
          Ir a Iniciar Sesión
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Restablecer Contraseña"
      subtitle="Crea una nueva contraseña para tu cuenta"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nueva Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Mínimo 8 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-10 pr-10"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Restableciendo...
            </>
          ) : (
            "Restablecer Contraseña"
          )}
        </Button>

        <Link to="/login" className="block">
          <Button variant="ghost" className="w-full">
            Volver al inicio de sesión
          </Button>
        </Link>
      </form>
    </AuthLayout>
  )
}

