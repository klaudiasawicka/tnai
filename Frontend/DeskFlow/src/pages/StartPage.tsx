import { useMemo } from "react"
import { useNavigate } from "react-router"
import {
  Calendar,
  X,
  Users,
  Briefcase,
  BookOpen,
  Wifi,
  Monitor,
  Wind,
  PenLine,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserDto } from "@/auth/authType"
import { ResourceType, ResourceStatus } from "@/types/resourceType"
import type { ResourceDto } from "@/types/resourceType"
import { BookingStatus } from "@/types/bookingType"
import { useMyBookings, useUpdateBookingStatus } from "@/hooks/useBookings"
import { useResources } from "@/hooks/useResources"

// ─── Helpers ──────────────────────────────────────────────────────────────────

const POLISH_DAYS = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"]
const POLISH_MONTHS = [
  "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia",
]
const POLISH_MONTHS_LONG = [
  "styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec",
  "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień",
]

function formatHeaderDate(d: Date) {
  const day = POLISH_DAYS[d.getDay()]
  const dayNum = d.getDate()
  const month = POLISH_MONTHS_LONG[d.getMonth()]
  const year = d.getFullYear()
  return `${day.charAt(0).toUpperCase() + day.slice(1)}, ${dayNum} ${month} ${year}`
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function formatDateBadge(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} ${POLISH_MONTHS[d.getMonth()]}`
}

function calcDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function resourceIcon(type: ResourceType) {
  if (type === ResourceType.Room) return <Users className="size-4" />
  if (type === ResourceType.Desk) return <Briefcase className="size-4" />
  return <BookOpen className="size-4" />
}

function subtypeLabelFromType(type: ResourceType): string {
  if (type === ResourceType.Room) return "Sala konferencyjna"
  if (type === ResourceType.Desk) return "Hot-desk"
  return "Pokój pracy cichej"
}

const EQUIPMENT_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="size-3" />,
  Projektor: <Monitor className="size-3" />,
  Klimatyzacja: <Wind className="size-3" />,
  Tablica: <PenLine className="size-3" />,
  Monitor: <Monitor className="size-3" />,
}

// ─── Component ────────────────────────────────────────────────────────────────

interface StartPageProps {
  user: UserDto
}

export function StartPage({ user }: StartPageProps) {
  const navigate = useNavigate()
  const now = new Date()

  const { data: myBookings = [] } = useMyBookings()
  const { data: resources = [] } = useResources()
  const updateStatus = useUpdateBookingStatus()

  const firstName = user.nameSurname.split(" ")[0]

  const resourceMap = useMemo(
    () => new Map(resources.map((r) => [r.id, r])),
    [resources],
  )

  const activeBookings = useMemo(
    () => myBookings.filter((b) => b.status !== BookingStatus.Cancelled && b.status !== BookingStatus.Past),
    [myBookings],
  )

  const todayBookings = useMemo(() => {
    return myBookings.filter((b) => {
      const d = new Date(b.startTime)
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      )
    })
  }, [myBookings])

  const nextBooking = useMemo(() => {
    return (
      myBookings
        .filter((b) => new Date(b.startTime) > now && b.status !== BookingStatus.Cancelled)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0] ?? null
    )
  }, [myBookings])

  const availableNow = useMemo(
    () => resources.filter((r) => r.status === ResourceStatus.Available),
    [resources],
  )

  const officeStats = useMemo(
    () => ({
      available: resources.filter((r) => r.status === ResourceStatus.Available).length,
      occupied: resources.filter(
        (r) => r.status === ResourceStatus.Booked || r.status === ResourceStatus.Occupied,
      ).length,
      maintenance: resources.filter((r) => r.status === ResourceStatus.Maintenance).length,
    }),
    [resources],
  )

  function handleCancel(bookingId: string) {
    updateStatus.mutate({ id: bookingId, status: BookingStatus.Cancelled })
  }

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-5 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold">Cześć, {firstName}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{formatHeaderDate(now)}</p>
        </div>
        <button
          onClick={() => navigate("/browse")}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold transition-colors cursor-pointer"
        >
          <Plus className="size-4" />
          Nowa rezerwacja
        </button>
      </div>

      <div className="px-6 pb-6 flex flex-col gap-5 flex-1">
        {/* ── Stat cards ── */}
        <div className="grid grid-cols-4 gap-4 shrink-0">
          <StatCard
            label="WOLNE TERAZ"
            value={officeStats.available}
            dotClass="bg-emerald-400"
            textClass="text-emerald-400"
          />
          <StatCard
            label="ZAJĘTE TERAZ"
            value={officeStats.occupied}
            dotClass="bg-rose-400"
            textClass="text-rose-400"
          />
          <StatCard
            label="W SERWISIE"
            value={officeStats.maintenance}
            dotClass="bg-amber-400"
            textClass="text-amber-400"
          />
          <StatCard
            label="TWOJE REZERWACJE"
            value={activeBookings.length}
            dotClass="bg-cyan-400"
            textClass="text-cyan-400"
          />
        </div>

        {/* ── Middle row ── */}
        <div className="grid grid-cols-2 gap-4 shrink-0">
          {/* Nearest booking */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
              Najbliższa rezerwacja
            </p>
            {nextBooking ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium">
                      {formatDateBadge(nextBooking.startTime)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatTime(nextBooking.startTime)} – {formatTime(nextBooking.endTime)}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-cyan-400">
                    {calcDuration(nextBooking.startTime, nextBooking.endTime)}
                  </span>
                </div>

                <div>
                  <p className="text-xl font-semibold">{nextBooking.resourceName}</p>
                  {(() => {
                    const r = resourceMap.get(nextBooking.resourceId)
                    if (!r) return null
                    return (
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {subtypeLabelFromType(r.type)} · Piętro {r.floor}
                      </p>
                    )
                  })()}
                </div>

                {nextBooking.note && (
                  <div className="px-3 py-2 rounded-lg bg-muted/30 text-sm text-muted-foreground">
                    {nextBooking.note}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => navigate("/bookings")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-sm hover:bg-muted/20 transition-colors cursor-pointer"
                  >
                    <Calendar className="size-3.5" />
                    Kalendarz
                  </button>
                  <button
                    onClick={() => handleCancel(nextBooking.id)}
                    disabled={updateStatus.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-rose-500/50 text-rose-400 text-sm hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X className="size-3.5" />
                    Anuluj
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Brak nadchodzących rezerwacji</p>
            )}
          </div>

          {/* Today's plan */}
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
              Plan na dziś
            </p>
            {todayBookings.length > 0 ? (
              <div className="flex flex-col divide-y divide-border">
                {todayBookings.map((b) => {
                  const r = resourceMap.get(b.resourceId)
                  return (
                    <div key={b.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div>
                          <p className="text-base font-semibold tabular-nums leading-none">
                            {formatTime(b.startTime)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatTime(b.endTime)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{b.resourceName}</p>
                          <p className="text-xs text-muted-foreground">
                            {calcDuration(b.startTime, b.endTime)} · {b.note || (r ? subtypeLabelFromType(r.type) : "")}
                          </p>
                        </div>
                      </div>
                      <BookingStatusBadge status={b.status} />
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Brak rezerwacji na dziś</p>
            )}
          </div>
        </div>

        {/* ── Available now ── */}
        <div className="shrink-0">
          <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-4">
            Dostępne teraz
          </p>
          {availableNow.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {availableNow.map((r) => (
                <ResourceCard key={r.id} resource={r} onBook={() => navigate("/browse", { state: { resourceId: r.id } })} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Brak dostępnych zasobów</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  dotClass,
  textClass,
}: {
  label: string
  value: number
  dotClass: string
  textClass: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-1.5 mb-3">
        <span className={cn("size-1.5 rounded-full", dotClass)} />
        <p className={cn("text-xs font-medium tracking-widest uppercase", textClass)}>{label}</p>
      </div>
      <p className="text-4xl font-semibold">{value}</p>
    </div>
  )
}

function BookingStatusBadge({ status }: { status: number }) {
  if (status === BookingStatus.Confirmed)
    return <span className="text-xs font-medium text-emerald-400">• Potwierdzona</span>
  if (status === BookingStatus.Pending)
    return <span className="text-xs font-medium text-amber-400">• Oczekująca</span>
  return <span className="text-xs text-muted-foreground">• Anulowana</span>
}

function ResourceCard({
  resource,
  onBook,
}: {
  resource: ResourceDto
  onBook: () => void
}) {
  return (
    <div
      onClick={onBook}
      className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:bg-muted/10 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
          {resourceIcon(resource.type)}
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Wolne
        </div>
      </div>
      <p className="text-sm font-semibold">{resource.name}</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        {subtypeLabelFromType(resource.type)} · P{resource.floor} · {resource.capacity} os.
      </p>
      <div className="flex items-center gap-1.5 mt-3">
        {resource.equipment.map((eq) => (
          <span
            key={eq.id}
            className="flex items-center gap-1 text-muted-foreground"
            title={eq.name}
          >
            {EQUIPMENT_ICONS[eq.name]}
          </span>
        ))}
      </div>
    </div>
  )
}
