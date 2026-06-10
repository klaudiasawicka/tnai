import { useState } from "react"
import { PenLine, LogOut } from "lucide-react"
import { useAuthStore } from "@/store/authStore"
import { useLogout } from "@/hooks/useAuth"

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)
  const logout = useLogout()

  const [renamingMode, setRenamingMode] = useState(false)
  const [nameInput, setNameInput] = useState(user?.nameSurname ?? "")

  if (!user) return null

  function handleRenameSave() {
    if (!user) return
    const trimmed = nameInput.trim()
    if (trimmed) {
      setUser({
        ...user,
        nameSurname: trimmed,
        initials: trimmed.charAt(0).toUpperCase(),
      })
    }
    setRenamingMode(false)
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex items-center px-6 py-5 shrink-0">
        <h1 className="text-2xl font-semibold">Ustawienia</h1>
      </div>

      <div className="px-6 pb-6 flex flex-col gap-4 max-w-xl">
        {/* ── Profil ── */}
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground px-1">
            PROFIL
          </p>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-white text-lg font-semibold">
                  {user.initials}
                </div>
                <div className="flex flex-col min-w-0">
                  {renamingMode ? (
                    <input
                      autoFocus
                      className="text-base font-semibold bg-transparent border-b border-cyan-500 outline-none w-full"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameSave()
                        if (e.key === "Escape") setRenamingMode(false)
                      }}
                      onBlur={handleRenameSave}
                    />
                  ) : (
                    <p className="text-base font-semibold truncate">{user.nameSurname || "—"}</p>
                  )}
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setNameInput(user.nameSurname)
                  setRenamingMode(true)
                }}
                className="self-start flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-muted/20 transition-colors cursor-pointer"
              >
                <PenLine className="size-3.5" />
                Zmień nazwę
              </button>
            </div>
          </div>
        </div>

        {/* ── Wyloguj ── */}
        <button
          onClick={logout}
          className="self-start flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-600 bg-rose-600/10 text-rose-500 hover:bg-rose-600/20 text-sm font-semibold transition-colors cursor-pointer"
        >
          <LogOut className="size-4" />
          Wyloguj się
        </button>

        <p className="text-xs text-muted-foreground mt-2">DeskFlow · v2.4.1 (build 184)</p>
      </div>
    </div>
  )
}
