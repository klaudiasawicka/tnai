import { useState, useMemo } from "react"
import { BookingStatus, ResourceType } from "@/types/bookingType"
import type { BookingDto } from "@/types/bookingType"
import { cn } from "@/lib/utils"
import { useBookings, useCancelBooking, useUpdateBookingStatus } from "@/hooks/useBookings"
import { Calendar, Clock, Users, X, Search, Check } from "lucide-react"

const DAY_NAMES = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"]
const MONTH_NAMES = [
  "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia",
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

function isOngoing(start: string, end: string) {
  const now = Date.now()
  return now >= new Date(start).getTime() && now <= new Date(end).getTime()
}

function isExpired(end: string) {
  return Date.now() > new Date(end).getTime()
}

function statusLabel(status: BookingDto["status"], start: string, end: string) {
  if (status === BookingStatus.Confirmed && isExpired(end)) return "Zakończono"
  if (status === BookingStatus.Confirmed && isOngoing(start, end)) return "W trakcie"
  if (status === BookingStatus.Confirmed) return "Potwierdzona"
  if (status === BookingStatus.Pending) return "Oczekująca"
  if (status === BookingStatus.Past) return "Przeszła"
  return "Anulowana"
}

function statusClass(status: BookingDto["status"], start: string, end: string) {
  if (status === BookingStatus.Confirmed && isExpired(end)) return "text-muted-foreground"
  if (status === BookingStatus.Confirmed && isOngoing(start, end)) return "text-blue-400"
  if (status === BookingStatus.Confirmed) return "text-emerald-400"
  if (status === BookingStatus.Pending) return "text-amber-400"
  return "text-muted-foreground"
}

function resourceTypeShort(type?: (typeof ResourceType)[keyof typeof ResourceType]) {
  if (type === ResourceType.Room) return "Sala"
  if (type === ResourceType.Desk) return "Biurko"
  if (type === ResourceType.Office) return "Pokój"
  return null
}

function resourceTypeLabel(type?: (typeof ResourceType)[keyof typeof ResourceType]) {
  if (type === ResourceType.Room) return "Sala konferencyjna"
  if (type === ResourceType.Desk) return "Biurko"
  if (type === ResourceType.Office) return "Pokój biurowy"
  return null
}

type StatusFilter = "all" | "active" | "upcoming" | "history" | "cancelled"

function BookingPanel({ booking, onClose }: { booking: BookingDto; onClose: () => void }) {
  const cancel = useCancelBooking()
  const updateStatus = useUpdateBookingStatus()
  const [confirming, setConfirming] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)

  const canCancel =
    !isExpired(booking.endTime) &&
    booking.status !== BookingStatus.Cancelled &&
    booking.status !== BookingStatus.Past
  const canConfirm = booking.status === BookingStatus.Pending && !isExpired(booking.endTime)

  async function handleCancel() {
    setCancelError(null)
    try {
      await cancel.mutateAsync(booking.id)
      onClose()
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: unknown } }
      const msg =
        typeof ax?.response?.data === "string"
          ? ax.response.data
          : `Błąd ${ax?.response?.status ?? "sieci"}`
      setCancelError(msg)
      setConfirming(false)
    }
  }

  return (
    <div className="w-72 shrink-0 border border-border rounded-xl bg-background flex flex-col overflow-hidden">
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex-1 min-w-0 pr-2">
          <h2 className="text-base font-semibold leading-tight truncate">{booking.resourceName}</h2>
          {resourceTypeLabel(booking.resourceType) && (
            <p className="text-xs text-muted-foreground mt-0.5">{resourceTypeLabel(booking.resourceType)}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-0.5"
        >
          <X size={16} />
        </button>
      </div>

      <div className="px-4 pb-3">
        <span className={cn("text-xs font-medium", statusClass(booking.status, booking.startTime, booking.endTime))}>
          • {statusLabel(booking.status, booking.startTime, booking.endTime)}
        </span>
      </div>

      <div className="px-4 flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Users size={14} />
            Pracownik
          </span>
          <span className="font-medium text-right truncate max-w-36">{booking.userNameSurname}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Calendar size={14} />
            Data
          </span>
          <span className="font-medium">{formatDate(booking.startTime)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Clock size={14} />
            Godzina
          </span>
          <span className="font-medium">
            {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-2">
            <Users size={14} />
            Uczestnicy
          </span>
          <span className="font-medium">
            {booking.participantCount}
            {booking.resourceCapacity ? ` z ${booking.resourceCapacity}` : ""}
          </span>
        </div>
        {booking.note && (
          <div className="flex flex-col gap-1">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">Notatka</p>
            <p className="text-sm">{booking.note}</p>
          </div>
        )}
      </div>

      <div className="p-4 pt-4 flex flex-col gap-2">
        {cancelError && <p className="text-xs text-red-400 text-center">{cancelError}</p>}
        {canConfirm && !confirming && (
          <button
            onClick={() => updateStatus.mutate({ id: booking.id, status: BookingStatus.Confirmed })}
            disabled={updateStatus.isPending}
            className="w-full flex items-center justify-center gap-2 border border-emerald-800 bg-emerald-950/40 text-emerald-400 rounded-full py-2 text-sm font-medium hover:bg-emerald-950/70 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Check size={14} />
            {updateStatus.isPending ? "Potwierdzanie…" : "Potwierdź rezerwację"}
          </button>
        )}
        {canCancel && !confirming && (
          <button
            onClick={() => setConfirming(true)}
            className="w-full flex items-center justify-center gap-2 border border-red-800 bg-red-950/40 text-red-400 rounded-full py-2 text-sm font-medium hover:bg-red-950/70 transition-colors cursor-pointer"
          >
            <X size={14} />
            Anuluj rezerwację
          </button>
        )}
        {canCancel && confirming && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-center text-muted-foreground">Czy na pewno chcesz anulować?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 border border-border rounded-full py-1.5 text-sm hover:bg-accent transition-colors cursor-pointer"
              >
                Nie
              </button>
              <button
                onClick={handleCancel}
                disabled={cancel.isPending}
                className="flex-1 border border-red-800 bg-red-950/40 text-red-400 rounded-full py-1.5 text-sm font-medium hover:bg-red-950/70 transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancel.isPending ? "…" : "Tak, anuluj"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function AdminRezerwacjePage() {
  const { data: allBookings = [], isLoading } = useBookings()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("upcoming")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return allBookings
      .filter((b) => {
        if (statusFilter === "active")
          return (
            (b.status === BookingStatus.Confirmed || b.status === BookingStatus.Pending) &&
            isOngoing(b.startTime, b.endTime)
          )
        if (statusFilter === "upcoming")
          return (
            (b.status === BookingStatus.Confirmed || b.status === BookingStatus.Pending) &&
            !isExpired(b.endTime)
          )
        if (statusFilter === "history")
          return (
            b.status === BookingStatus.Past ||
            (b.status === BookingStatus.Confirmed && isExpired(b.endTime))
          )
        if (statusFilter === "cancelled") return b.status === BookingStatus.Cancelled
        return true
      })
      .filter((b) => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
          b.resourceName.toLowerCase().includes(q) ||
          b.userNameSurname.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
  }, [allBookings, statusFilter, search])

  const counts = {
    all: allBookings.length,
    active: allBookings.filter(
      (b) =>
        (b.status === BookingStatus.Confirmed || b.status === BookingStatus.Pending) &&
        isOngoing(b.startTime, b.endTime),
    ).length,
    upcoming: allBookings.filter(
      (b) =>
        (b.status === BookingStatus.Confirmed || b.status === BookingStatus.Pending) &&
        !isExpired(b.endTime),
    ).length,
  }

  const selectedBooking = allBookings.find((b) => b.id === selectedId) ?? null

  const FILTERS: { key: StatusFilter; label: string; count?: number }[] = [
    { key: "upcoming", label: "Nadchodzące", count: counts.upcoming },
    { key: "active",   label: "W trakcie",   count: counts.active },
    { key: "history",  label: "Historia" },
    { key: "cancelled", label: "Anulowane" },
    { key: "all",      label: "Wszystkie",   count: counts.all },
  ]

  return (
    <div className="h-full flex flex-col overflow-hidden px-8 pt-7 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Rezerwacje</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {counts.upcoming} nadchodzących · {counts.active} aktywnych
          </p>
        </div>
        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj pracownika lub sali…"
            className="pl-9 pr-3 py-2 text-sm bg-muted/30 border border-border rounded-lg w-64 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 mb-6 shrink-0">
        {FILTERS.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => { setStatusFilter(key); setSelectedId(null) }}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full font-medium transition-colors cursor-pointer",
              statusFilter === key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {label}
            {count !== undefined && (
              <span className={cn("ml-1.5 text-xs", statusFilter === key ? "opacity-70" : "text-muted-foreground")}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Table */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_200px_120px_100px] gap-4 pb-3 border-b border-border shrink-0">
            {(["Pomieszczenie", "Pracownik", "Data i czas", "Czas trwania", "Status"] as const).map((h) => (
              <span key={h} className="text-xs font-medium text-muted-foreground tracking-widest uppercase last:text-right">
                {h}
              </span>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="py-8 text-center text-sm text-muted-foreground">Ładowanie…</div>
            )}
            {!isLoading && filtered.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">Brak rezerwacji</div>
            )}
            {filtered.map((b) => {
              const isSelected = selectedId === b.id
              const typeShort = resourceTypeShort(b.resourceType)
              const subtitle =
                typeShort && b.resourceFloor != null
                  ? `${typeShort} · P${b.resourceFloor}`
                  : (typeShort ?? null)

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedId((prev) => (prev === b.id ? null : b.id))}
                  className={cn(
                    "grid grid-cols-[1fr_1fr_200px_120px_100px] gap-4 items-center py-4 border-b border-border cursor-pointer transition-colors hover:bg-accent/30",
                    isSelected && "border-l-2 border-l-cyan-500 pl-2 bg-accent/20",
                  )}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{b.resourceName}</p>
                    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm truncate">{b.userNameSurname}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{formatDate(b.startTime)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(b.startTime)} – {formatTime(b.endTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">{calcDuration(b.startTime, b.endTime)}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn("text-sm", statusClass(b.status, b.startTime, b.endTime))}>
                      • {statusLabel(b.status, b.startTime, b.endTime)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        {selectedBooking && (
          <BookingPanel booking={selectedBooking} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  )
}
