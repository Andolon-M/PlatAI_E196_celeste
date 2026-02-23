import { Routes, Route, Navigate } from 'react-router-dom'
import { LandingPage } from '@/modules/landing/pages/public/landing-page'
import { AdminLayout } from '@/shared/layouts/admin-layout'
import { AdminDashboard } from '@/modules/dashboard/pages/dashboard'
import { UsersPage } from '@/modules/users/pages' 

import {
  LoginPage,
  // RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  PrivacyPolicyPage,
} from '@/modules/auth/pages/public'
import { ProtectedRoute } from '@/shared/components/protected-route'
import { GuestRoute } from '@/shared/components/guest-route'

export default function AppRouter() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<LandingPage />} />

      {/* Rutas de Autenticación - Solo para usuarios NO autenticados */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      {/* <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} /> */}
      <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
      <Route path="/reset-password/:token" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />

      {/* Política de privacidad - Accesible para todos */}
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

      {/* Rutas de Admin con Layout compartido - Protegidas */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersPage />} />
        
      </Route>

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

