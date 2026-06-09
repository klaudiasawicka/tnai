import { Routes, Route, Navigate } from 'react-router'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { RoleName } from '@/auth/authType'
import { useAuthStore } from '@/store/authStore'
import { useLogin, useRegister, useLogout } from '@/hooks/useAuth'
import { BookingsPage } from '@/pages/BookingsPage'
import { BrowsePage } from '@/pages/BrowsePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { StartPage } from '@/pages/StartPage'
import { StatusBiuraPage } from '@/pages/admin/StatusBiuraPage'
import { ZarzadzaniePage } from '@/pages/admin/ZarzadzaniePage'

function AuthenticatedApp() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  if (!user) return <Navigate to="/login" replace />

  const isAdmin = user.roleName === RoleName.Admin

  return (
    <SidebarProvider className="h-svh">
      <AppSidebar user={user} onLogout={logout} />
      <main className="flex-1 overflow-hidden flex flex-col">
        <Routes>
          <Route
            path="/admin/status"
            element={isAdmin ? <StatusBiuraPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/admin/zarzadzanie"
            element={isAdmin ? <ZarzadzaniePage /> : <Navigate to="/" replace />}
          />

          <Route path="/browse" element={<BrowsePage />} />
          <Route
            path="/bookings"
            element={
              <div className="p-6 overflow-auto flex-1">
                <BookingsPage />
              </div>
            }
          />
          <Route
            path="/settings"
            element={
              <div className="p-6 text-sm text-muted-foreground">Ustawienia</div>
            }
          />

          <Route
            path="/"
            element={
              isAdmin ? <Navigate to="/admin/status" replace /> : <StartPage user={user} />
            }
          />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </SidebarProvider>
  )
}

function UnauthenticatedApp() {
  const loginMutation = useLogin()
  const registerMutation = useRegister()

  async function handleLogin(email: string, password: string): Promise<boolean> {
    try {
      await loginMutation.mutateAsync({ email, password })
      return true
    } catch {
      return false
    }
  }

  async function handleRegister(
    email: string,
    password: string,
    nameSurname: string
  ): Promise<boolean> {
    try {
      await registerMutation.mutateAsync({ email, password, nameSurname })
      return true
    } catch {
      return false
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
      <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <AuthenticatedApp /> : <UnauthenticatedApp />
}

export default App
