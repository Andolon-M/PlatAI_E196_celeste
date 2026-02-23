import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/shared/contexts/theme-provider'
import { AuthProvider } from '@/shared/contexts/auth-context'
import { NotificationsProvider } from '@/shared/contexts/notifications-context'
import { Toaster } from '@/shared/components/ui/sonner'
import '@/shared/styles/globals.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="system" storageKey="app-theme" enableSystem={true}>
        <AuthProvider>
          <NotificationsProvider>
            <App />
            <Toaster />
          </NotificationsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
