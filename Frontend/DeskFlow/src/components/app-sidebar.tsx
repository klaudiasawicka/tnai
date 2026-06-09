import { NavLink, useMatch } from "react-router"
import {
  CalendarDays,
  Home,
  LayoutDashboard,
  LayoutList,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  type LucideIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import type { UserDto } from "@/auth/authType"
import { RoleName } from "@/auth/authType"

const adminNavItems = [
  { label: "Status biura", icon: LayoutDashboard, to: "/admin/status" },
  { label: "Zarządzanie",  icon: LayoutList,      to: "/admin/zarzadzanie" },
]

const accountNavItems = [
  { label: "Start",      icon: Home,        to: "/" },
  { label: "Przeglądaj", icon: Search,      to: "/browse" },
]

const userNavItems = [
  { label: "Start",       icon: Home,        to: "/" },
  { label: "Przeglądaj",  icon: Search,      to: "/browse" },
  { label: "Rezerwacje",  icon: CalendarDays, to: "/bookings" },
]

function NavItem({ label, icon: Icon, to }: { label: string; icon: LucideIcon; to: string }) {
  const match = useMatch(to === "/" ? { path: to, end: true } : to)
  const isActive = !!match
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        render={<NavLink to={to} end={to === "/"} />}
        isActive={isActive}
        className={cn("w-full", isActive && "font-medium")}
      >
        <Icon />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

interface AppSidebarProps {
  user: UserDto
  onLogout: () => void
}

export function AppSidebar({ user, onLogout }: AppSidebarProps) {
  const settingsMatch = useMatch("/settings")
  const { theme, setTheme } = useTheme()
  const isAdmin = user.roleName === RoleName.Admin

  function toggleTheme() {
    const isDark =
      theme === "dark" ||
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setTheme(isDark ? "light" : "dark")
  }

  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-500 text-white">
            <LayoutDashboard className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">DeskFlow</span>
            <span className="text-xs text-muted-foreground">Rezerwacja biurek</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isAdmin ? (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Administrator</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavItems.map((item) => (
                    <NavItem key={item.to} {...item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Konto</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {accountNavItems.map((item) => (
                    <NavItem key={item.to} {...item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        ) : (
          <SidebarGroup>
            <SidebarGroupLabel>Konto</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userNavItems.map((item) => (
                  <NavItem key={item.to} {...item} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 pt-2">
        <SidebarMenuButton
          render={<NavLink to="/settings" />}
          isActive={!!settingsMatch}
          className="w-full"
        >
          <Settings />
          <span>Ustawienia</span>
        </SidebarMenuButton>

        <SidebarSeparator className="my-2" />

        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-sm font-semibold text-white">
            {user.initials}
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{user.nameSurname}</span>
            <span className="truncate text-xs text-muted-foreground">
              {isAdmin ? "Administrator" : "Pracownik"}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Zmień motyw"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <button
            onClick={onLogout}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Wyloguj"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
