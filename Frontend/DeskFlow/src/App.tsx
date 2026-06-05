import { Routes, Route } from "react-router"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import type { UserDto } from "@/auth/authType"
import { RoleName } from "@/auth/authType"
import { BookingsPage } from "@/pages/BookingsPage"
import { BrowsePage } from "@/pages/BrowsePage"

const mockUser: UserDto = {
  id: "1",
  email: "anna.kowalska@example.com",
  nameSurname: "Anna Kowalska",
  initials: "AK",
  createdAt: "",
  roleId: "1",
  roleName: RoleName.User,
}

export function App() {
  return (
    <SidebarProvider className="h-svh">
      <AppSidebar user={mockUser} onLogout={() => {}} />
      <main className="flex-1 overflow-hidden flex flex-col">
        <Routes>
          <Route path="/" element={<div className="p-6 text-sm text-muted-foreground">Strona główna</div>} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/bookings" element={<div className="p-6 overflow-auto flex-1"><BookingsPage /></div>} />
          <Route path="/settings" element={<div className="p-6 text-sm text-muted-foreground">Ustawienia</div>} />
        </Routes>
      </main>
    </SidebarProvider>
  )
}

export default App
