import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { AuthLayout } from "../../components/auth-layout"
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/shared/components/ui/card"
import { authService } from "../../services/auth.service"
import type { ForgotPasswordData } from "../../types"

export function ForgotPasswordPage() {
  const [formData, setFormData] = useState<ForgotPasswordData>({
    email: "",
  })
  const [emailSent, setEmailSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await authService.forgotPassword(formData)
      setEmailSent(true)
    } catch (error) {
      console.error("Error al solicitar recuperación:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <AuthLayout
        title="Correo Enviado"
        subtitle="Revisa tu bandeja de entrada"
      >
        <Card className="border-green-500/50 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Correo Enviado Exitosamente</h3>
                <p className="text-sm text-muted-foreground">
                  Hemos enviado un enlace de recuperación a <strong>{formData.email}</strong>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Por favor, revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button onClick={() => setEmailSent(false)} variant="outline" className="w-full">
            Enviar nuevamente
          </Button>

          <Link to="/login" className="block">
            <Button variant="ghost" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Recuperar Contraseña"
      subtitle="Ingresa tu correo para recibir instrucciones"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                className="pl-10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Te enviaremos un enlace para restablecer tu contraseña
            </p>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Enlace de Recuperación"
          )}
        </Button>

        <Link to="/login" className="block">
          <Button variant="ghost" className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio de sesión
          </Button>
        </Link>
      </form>
    </AuthLayout>
  )
}

