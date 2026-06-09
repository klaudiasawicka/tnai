import { useState } from "react"
import { BookingStatus } from "@/types/bookingType"
import type { BookingDto } from "@/types/bookingType"
import { cn } from "@/lib/utils"
import { useMyBookings } from "@/hooks/useBookings"

const DAY_NAMES = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"]
const MONTH_NAMES = [
  "stycznia",
  "lutego",
  "marca",
  "kwietnia",
  "maja",
  "czerwca",
  "lipca",
  "sierpnia",
  "września",
  "października",
  "listopada",
  "grudnia",
]

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function calcDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function statusLabel(status: BookingStatus) {
  if (status === BookingStatus.Confirmed) return "Potwierdzona"
  if (status === BookingStatus.Pending) return "Oczekująca"
  if (status === BookingStatus.Past) return "Przeszła"
  return "Anulowana"
}

function statusClass(status: BookingStatus) {
  if (status === BookingStatus.Confirmed) return "text-emerald-400"
  if (status === BookingStatus.Pending) return "text-amber-400"
  return "text-muted-foreground"
}

type Tab = "upcoming" | "history"

export function BookingsPage() {
  const { data: allBookings = [], isLoading } = useMyBookings()
  const [tab, setTab] = useState<Tab>("upcoming")

  const upcoming = allBookings.filter(
    (b) => b.status === BookingStatus.Confirmed || b.status === BookingStatus.Pending,
  )
  const history = allBookings.filter(
    (b) => b.status === BookingStatus.Past || b.status === BookingStatus.Cancelled,
  )

  const bookings: BookingDto[] = tab === "upcoming" ? upcoming : history
  const activeCount = upcoming.length

  return (
    <div className="flex flex-col">
      <div className="mb-1">
        <h1 className="text-xl font-semibold">Moje rezerwacje</h1>
        <p className="text-sm text-muted-foreground">{activeCount} aktywnych</p>
      </div>

      <div className="h-px bg-border my-5" />

      <div className="flex items-center gap-1 mb-6">
        <button
          onClick={() => setTab("upcoming")}
          className={cn(
            "px-3 py-1 text-sm rounded transition-colors cursor-pointer",
            tab === "upcoming"
              ? "border border-border text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Nadchodzące
        </button>
        <button
          onClick={() => setTab("history")}
          className={cn(
            "px-3 py-1 text-sm rounded transition-colors cursor-pointer",
            tab === "history"
              ? "border border-border text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Historia
        </button>
      </div>

      <div className="flex items-center gap-4 pb-3 border-b border-border">
        <div className="flex-1 text-xs font-medium text-muted-foreground tracking-widest uppercase">
          Pomieszczenie
        </div>
        <div className="w-52 text-xs font-medium text-muted-foreground tracking-widest uppercase">
          Data i czas
        </div>
        <div className="w-28 text-right text-xs font-medium text-muted-foreground tracking-widest uppercase">
          Czas trwania
        </div>
        <div className="w-28 text-right text-xs font-medium text-muted-foreground tracking-widest uppercase">
          Status
        </div>
      </div>

      {isLoading && (
        <div className="py-8 text-center text-sm text-muted-foreground">Ładowanie…</div>
      )}
      {!isLoading && bookings.length === 0 && (
        <div className="py-8 text-center text-sm text-muted-foreground">Brak rezerwacji</div>
      )}
      {bookings.map((b) => (
        <div
          key={b.id}
          className="flex items-center gap-4 py-4 border-b border-border"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{b.resourceName}</p>
          </div>
          <div className="w-52">
            <p className="text-sm font-medium">{formatDate(b.startTime)}</p>
            <p className="text-xs text-muted-foreground">
              {formatTime(b.startTime)} – {formatTime(b.endTime)}
            </p>
          </div>
          <div className="w-28 text-right">
            <p className="text-sm">{calcDuration(b.startTime, b.endTime)}</p>
          </div>
          <div className="w-28 text-right">
            <p className={cn("text-sm", statusClass(b.status))}>
              • {statusLabel(b.status)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
