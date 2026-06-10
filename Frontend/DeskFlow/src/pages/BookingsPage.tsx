import { useState } from "react"
import { BookingStatus, ResourceType } from "@/types/bookingType"
import type { BookingDto } from "@/types/bookingType"
import { cn } from "@/lib/utils"
import { useMyBookings, useCancelBooking, useConfirmBooking } from "@/hooks/useBookings"
import { Calendar, Clock, Users, X, Check } from "lucide-react"

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

function isOngoing(start: string, end: string) {
  const now = Date.now()
  return now >= new Date(start).getTime() && now <= new Date(end).getTime()
}

function isExpired(end: string) {
  return Date.now() > new Date(end).getTime()
}

function statusLabel(status: BookingStatus, start: string, end: string) {
  if (status === BookingStatus.Confirmed && isExpired(end)) return "Zakończono"
  if (status === BookingStatus.Confirmed && isOngoing(start, end)) return "W trakcie"
  if (status === BookingStatus.Confirmed) return "Potwierdzona"
  if (status === BookingStatus.Pending) return "Oczekująca"
  if (status === BookingStatus.Past) return "Przeszła"
  return "Anulowana"
}

function statusClass(status: BookingStatus, start: string, end: string) {
  if (status === BookingStatus.Confirmed && isExpired(end)) return "text-muted-foreground"
  if (status === BookingStatus.Confirmed && isOngoing(start, end)) return "text-blue-400"
  if (status === BookingStatus.Confirmed) return "text-emerald-400"
  if (status === BookingStatus.Pending) return "text-amber-400"
  return "text-muted-foreground"
}

function resourceTypeLabel(type?: ResourceType) {
  if (type === ResourceType.Room) return "Sala konferencyjna"
  if (type === ResourceType.Desk) return "Biurko"
  if (type === ResourceType.Office) return "Pokój biurowy"
  return null
}

function resourceTypeShort(type?: ResourceType) {
  if (type === ResourceType.Room) return "Sala"
  if (type === ResourceType.Desk) return "Biurko"
  if (type === ResourceType.Office) return "Pokój"
  return null
}



type Tab = "upcoming" | "history"

function BookingPanel({
  booking,
  onClose,
}: {
  booking: BookingDto
  onClose: () => void
}) {
  const cancel = useCancelBooking()
  const confirm = useConfirmBooking()
  const [confirming, setConfirming] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const canCancel =
    !isExpired(booking.endTime) &&
    booking.status !== BookingStatus.Cancelled &&
    booking.status !== BookingStatus.Past
  const canConfirm = booking.status === BookingStatus.Pending && !isExpired(booking.endTime)

  const typeLabel = resourceTypeLabel(booking.resourceType)

  async function handleCancel() {
    setCancelError(null)
    try {
      await cancel.mutateAsync(booking.id)
      onClose()
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: unknown } }
      const status = ax?.response?.status
      const msg = typeof ax?.response?.data === "string"
        ? ax.response.data
        : `Błąd ${status ?? "sieci"}`
      setCancelError(msg)
      setConfirming(false)
    }
  }

  return (
    <div className="w-72 shrink-0 border border-border rounded-xl bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex-1 min-w-0 pr-2">
          <h2 className="text-base font-semibold leading-tight truncate">{booking.resourceName}</h2>
          {typeLabel && <p className="text-xs text-muted-foreground mt-0.5">{typeLabel}</p>}
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer mt-0.5"
        >
          <X size={16} />
        </button>
      </div>

      {/* Status badge */}
      <div className="px-4 pb-3">
        <span
          className={cn(
            "text-xs font-medium",
            statusClass(booking.status, booking.startTime, booking.endTime),
          )}
        >
          • {statusLabel(booking.status, booking.startTime, booking.endTime)}
        </span>
      </div>

      {/* Details */}
      <div className="px-4 flex flex-col gap-3 flex-1">
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
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
              Notatka
            </p>
            <p className="text-sm">{booking.note}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 pt-4 flex flex-col gap-2">
        {cancelError && (
          <p className="text-xs text-red-400 text-center">{cancelError}</p>
        )}
        {canConfirm && !confirming && (
          <button
            onClick={() => confirm.mutate(booking.id)}
            disabled={confirm.isPending}
            className="w-full flex items-center justify-center gap-2 border border-emerald-800 bg-emerald-950/40 text-emerald-400 rounded-lg py-2 text-sm font-medium hover:bg-emerald-950/70 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Check size={14} />
            {confirm.isPending ? "Potwierdzanie…" : "Potwierdź rezerwację"}
          </button>
        )}
        {canCancel && !confirming && (
          <button
            onClick={() => setConfirming(true)}
            className="w-full flex items-center justify-center gap-2 border border-red-800 bg-red-950/40 text-red-400 rounded-lg py-2 text-sm font-medium hover:bg-red-950/70 transition-colors cursor-pointer"
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
                className="flex-1 border border-border rounded-lg py-1.5 text-sm hover:bg-accent transition-colors cursor-pointer"
              >
                Nie
              </button>
              <button
                onClick={handleCancel}
                disabled={cancel.isPending}
                className="flex-1 border border-red-800 bg-red-950/40 text-red-400 rounded-lg py-1.5 text-sm font-medium hover:bg-red-950/70 transition-colors cursor-pointer disabled:opacity-50"
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

export function BookingsPage() {
  const { data: allBookings = [], isLoading } = useMyBookings()
  const [tab, setTab] = useState<Tab>("upcoming")
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const upcoming = allBookings.filter(
    (b) =>
      (b.status === BookingStatus.Confirmed && !isExpired(b.endTime)) ||
      b.status === BookingStatus.Pending,
  )
  const history = allBookings.filter(
    (b) =>
      b.status === BookingStatus.Past ||
      b.status === BookingStatus.Cancelled ||
      (b.status === BookingStatus.Confirmed && isExpired(b.endTime)),
  )

  const bookings: BookingDto[] = tab === "upcoming" ? upcoming : history
  const activeCount = upcoming.length
  const selectedBooking = allBookings.find((b) => b.id === selectedId) ?? null

  function handleRowClick(b: BookingDto) {
    setSelectedId((prev) => (prev === b.id ? null : b.id))
  }

  return (
    <div className="flex flex-col h-full">
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

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Table */}
        <div className="flex-1 min-w-0 flex flex-col">
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
          {bookings.map((b) => {
            const isSelected = selectedId === b.id
            const typeShort = resourceTypeShort(b.resourceType)
            const subtitle =
              typeShort && b.resourceFloor != null
                ? `${typeShort} · P${b.resourceFloor}`
                : typeShort ?? null

            return (
              <div
                key={b.id}
                onClick={() => handleRowClick(b)}
                className={cn(
                  "flex items-center gap-4 py-4 border-b border-border cursor-pointer transition-colors hover:bg-accent/30",
                  isSelected && "border-l-2 border-l-emerald-500 pl-2 bg-accent/20",
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{b.resourceName}</p>
                  {subtitle && (
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                  )}
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
                  <p className={cn("text-sm", statusClass(b.status, b.startTime, b.endTime))}>
                    • {statusLabel(b.status, b.startTime, b.endTime)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Detail panel */}
        {selectedBooking && (
          <BookingPanel booking={selectedBooking} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  )
}
