import { useState } from "react"
import { Link } from "react-router"
import { Eye, EyeOff, LayoutDashboard, Lock, Mail } from "lucide-react"

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<boolean>
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const success = await onLogin(email, password)
      if (!success) setError("Nieprawidłowy email lub hasło.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0e0e0e" }}>
      <div className="w-full max-w-215 rounded-2xl overflow-hidden flex shadow-2xl border border-white/5">
        {/* Left panel */}
        <div
          className="hidden md:flex flex-[1.2] flex-col justify-between p-10"
          style={{ background: "#161618" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-500 text-white">
              <LayoutDashboard className="size-5" />
            </div>
            <span className="text-white font-semibold text-base">DeskFlow</span>
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-white text-3xl font-bold leading-tight">
              Zarezerwuj swoje<br />miejsce w biurze
            </h1>
            <p className="text-sm" style={{ color: "#888" }}>
              System hot-deskingu i rezerwacji sal<br />konferencyjnych dla całego zespołu.
            </p>
          </div>

          <div className="flex gap-8">
            {[
              { value: "8", label: "Sal konf." },
              { value: "40+", label: "Biurek" },
              { value: "200+", label: "Użytkowników" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-cyan-400 font-bold text-lg">{stat.value}</div>
                <div className="text-xs" style={{ color: "#666" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div
          className="flex-1 flex flex-col justify-center p-10 gap-6"
          style={{ background: "#1e1e20" }}
        >
          <div>
            <h2 className="text-white text-2xl font-bold">Zaloguj się</h2>
            <p className="text-sm mt-1" style={{ color: "#888" }}>
              Wprowadź dane konta firmowego
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "#888" }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: "#555" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="anna.kowalska@firma.pl"
                  required
                  className="w-full rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none transition-colors"
                  style={{ background: "#2a2a2c", border: "1px solid rgba(255,255,255,0.08)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "#888" }}>
                Hasło
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4" style={{ color: "#555" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-[#555] focus:outline-none transition-colors"
                  style={{ background: "#2a2a2c", border: "1px solid rgba(255,255,255,0.08)" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#555" }}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs transition-colors"
                  style={{ color: "#888" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ccc")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
                >
                  Zapomniałeś hasła?
                </button>
              </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-2.5 rounded-lg text-sm transition-colors mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#22d3ee", color: "#0a0a0a" }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = "#67e8f9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#22d3ee")}
            >
              {loading ? "Logowanie…" : "Zaloguj się"}
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: "#666" }}>
            Brak konta?{" "}
            <Link
              to="/register"
              className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Zarejestruj się
            </Link>
          </p>

          <div className="rounded-lg px-4 py-3 text-xs" style={{ background: "#2a2a2c", color: "#666" }}>
            Nie masz konta?{" "}
            <span style={{ color: "#888" }}>Zarejestruj się</span> — rejestracja tworzy konto z rolą <span style={{ color: "#888" }}>Pracownik</span>.
          </div>
        </div>
      </div>
    </div>
  )
}
