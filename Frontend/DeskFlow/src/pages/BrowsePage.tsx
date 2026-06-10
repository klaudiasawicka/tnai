import { useState, useMemo, useRef } from "react"
import { useLocation } from "react-router"
import { ResourceType, ResourceStatus } from "@/types/resourceType"
import { useResources } from "@/hooks/useResources"
import { useBookings, useCreateBooking } from "@/hooks/useBookings"
import { useAuthStore } from "@/store/authStore"
import type { CreateBookingDto } from "@/types/bookingType"
import { BookingStatus } from "@/types/bookingType"
import { cn } from "@/lib/utils"
import {
  Users,
  Briefcase,
  BookOpen,
  Search,
  X,
  ChevronUp,
  ChevronDown,
  Wifi,
  Monitor,
  Wind,
  PenLine,
} from "lucide-react"

// ─── Local types ──────────────────────────────────────────────────────────────

interface Booking {
  start: number // decimal hour, e.g. 9.5 = 9:30
  end: number
  person: string
  isPast?: boolean
}

interface Resource {
  id: string
  name: string
  type: (typeof ResourceType)[keyof typeof ResourceType]
  status: (typeof ResourceStatus)[keyof typeof ResourceStatus]
  floor: number
  capacity: number
  description: string
  subtypeLabel: string
  equipment: string[]
  bookings: Booking[]
}

// ─── Mapper ResourceDto → lokalny Resource ────────────────────────────────────

function subtypeLabel(type: Resource["type"]): string {
  if (type === ResourceType.Room) return "Sala konferencyjna"
  if (type === ResourceType.Desk) return "Hot-desk"
  return "Pokój"
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const POLISH_DAYS = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"]
const POLISH_MONTHS = [
  "stycznia", "lutego", "marca", "kwietnia", "maja", "czerwca",
  "lipca", "sierpnia", "września", "października", "listopada", "grudnia",
]

const EQUIPMENT_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="size-3.5" />,
  Projektor: <Monitor className="size-3.5" />,
  Klimatyzacja: <Wind className="size-3.5" />,
  Tablica: <PenLine className="size-3.5" />,
  Monitor: <Monitor className="size-3.5" />,
}

function formatMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function resourceIcon(type: Resource["type"]) {
  if (type === ResourceType.Room) return <Users className="size-4" />
  if (type === ResourceType.Desk) return <Briefcase className="size-4" />
  return <BookOpen className="size-4" />
}

function statusConfig(status: Resource["status"]) {
  if (status === ResourceStatus.Available)
    return {
      label: "Wolne",
      dot: "bg-emerald-400",
      text: "text-emerald-400",
      icon: "bg-emerald-500/20 text-emerald-400",
    }
  if (status === ResourceStatus.Maintenance)
    return {
      label: "Serwis",
      dot: "bg-amber-400",
      text: "text-amber-400",
      icon: "bg-amber-500/20 text-amber-400",
    }
  return {
    label: "Zajęte",
    dot: "bg-rose-400",
    text: "text-rose-400",
    icon: "bg-rose-500/20 text-rose-400",
  }
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

const TIMELINE_START = 8
const TIMELINE_END = 20
const TIMELINE_RANGE = TIMELINE_END - TIMELINE_START

const TIMELINE_START_MIN = TIMELINE_START * 60  // 480
const TIMELINE_END_MIN = TIMELINE_END * 60      // 1200
const TIMELINE_RANGE_MIN = TIMELINE_RANGE * 60  // 720
const MIN_DURATION = 30

function snapToGrid(m: number): number {
  return Math.round(m / 30) * 30
}

function minutesToPct(minutes: number): number {
  return ((minutes - TIMELINE_START_MIN) / TIMELINE_RANGE_MIN) * 100
}

interface TimelineBarProps {
  bookings: Booking[]
  startMinutes: number
  endMinutes: number
  onStartChange: (v: number) => void
  onEndChange: (v: number) => void
}

function TimelineBar({
  bookings,
  startMinutes,
  endMinutes,
  onStartChange,
  onEndChange,
}: TimelineBarProps) {
  const barRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    mode: "drag" | "resize-left" | "resize-right"
    startX: number
    startStart: number
    startEnd: number
  } | null>(null)

  const activeBookings = bookings
  const occupied = activeBookings.map(b => ({ start: b.start * 60, end: b.end * 60 }))
  const isOccupied = (s: number, e: number) => occupied.some(b => s < b.end && e > b.start)

  const now = new Date()
  const nowHour = now.getHours() + now.getMinutes() / 60
  const nowPct = ((nowHour - TIMELINE_START) / TIMELINE_RANGE) * 100
  const showNow = nowHour >= TIMELINE_START && nowHour <= TIMELINE_END
  const hourMarkers = [8, 10, 12, 14, 16, 18, 20]

  const selLeft = minutesToPct(startMinutes)
  const selWidth = ((endMinutes - startMinutes) / TIMELINE_RANGE_MIN) * 100

  function xToMinutes(clientX: number): number {
    if (!barRef.current) return startMinutes
    const rect = barRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return snapToGrid(pct * TIMELINE_RANGE_MIN + TIMELINE_START_MIN)
  }

  function startInteraction(
    mode: "drag" | "resize-left" | "resize-right",
    clientX: number,
  ) {
    dragRef.current = {
      mode,
      startX: clientX,
      startStart: startMinutes,
      startEnd: endMinutes,
    }

    function handleMove(e: MouseEvent | TouchEvent) {
      if (!dragRef.current || !barRef.current) return
      if ("touches" in e) e.preventDefault()
      const cx = "touches" in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX
      const rect = barRef.current.getBoundingClientRect()
      const deltaMin = ((cx - dragRef.current.startX) / rect.width) * TIMELINE_RANGE_MIN
      const { mode: m, startStart, startEnd } = dragRef.current
      const dur = startEnd - startStart

      if (m === "drag") {
        let newStart = snapToGrid(startStart + deltaMin)
        let newEnd = newStart + dur
        if (newStart < TIMELINE_START_MIN) { newStart = TIMELINE_START_MIN; newEnd = TIMELINE_START_MIN + dur }
        if (newEnd > TIMELINE_END_MIN) { newEnd = TIMELINE_END_MIN; newStart = TIMELINE_END_MIN - dur }
        if (isOccupied(newStart, newEnd)) {
          const blocking = occupied.filter(b => newStart < b.end && newEnd > b.start)
          if (deltaMin > 0) {
            const edge = snapToGrid(Math.min(...blocking.map(b => b.start)) - dur)
            if (edge >= TIMELINE_START_MIN && !isOccupied(edge, edge + dur)) {
              onStartChange(edge); onEndChange(edge + dur)
            }
          } else if (deltaMin < 0) {
            const edge = snapToGrid(Math.max(...blocking.map(b => b.end)))
            if (edge + dur <= TIMELINE_END_MIN && !isOccupied(edge, edge + dur)) {
              onStartChange(edge); onEndChange(edge + dur)
            }
          }
          return
        }
        onStartChange(newStart)
        onEndChange(newEnd)
      } else if (m === "resize-right") {
        let newEnd = Math.min(
          TIMELINE_END_MIN,
          Math.max(startStart + MIN_DURATION, snapToGrid(startEnd + deltaMin)),
        )
        const rightBlock = occupied.filter(b => b.start >= startStart + MIN_DURATION)
        if (rightBlock.length > 0) {
          const firstRight = Math.min(...rightBlock.map(b => b.start))
          if (newEnd > firstRight) newEnd = firstRight
        }
        onEndChange(newEnd)
      } else {
        let newStart = Math.max(
          TIMELINE_START_MIN,
          Math.min(startEnd - MIN_DURATION, snapToGrid(startStart + deltaMin)),
        )
        const leftBlock = occupied.filter(b => b.end <= startEnd - MIN_DURATION)
        if (leftBlock.length > 0) {
          const lastLeft = Math.max(...leftBlock.map(b => b.end))
          if (newStart < lastLeft) newStart = lastLeft
        }
        onStartChange(newStart)
      }
    }

    function handleUp() {
      dragRef.current = null
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleUp)
      document.removeEventListener("touchmove", handleMove as EventListener)
      document.removeEventListener("touchend", handleUp)
    }

    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleUp)
    document.addEventListener("touchmove", handleMove as EventListener, { passive: false })
    document.addEventListener("touchend", handleUp)
  }

  function handleBarMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (e.button !== 0) return
    const clickedMin = xToMinutes(e.clientX)
    if (occupied.some(b => clickedMin >= b.start && clickedMin < b.end)) return
    const dur = endMinutes - startMinutes
    let newStart = clickedMin
    let newEnd = newStart + dur
    if (newEnd > TIMELINE_END_MIN) { newEnd = TIMELINE_END_MIN; newStart = TIMELINE_END_MIN - dur }
    if (newStart < TIMELINE_START_MIN) { newStart = TIMELINE_START_MIN; newEnd = newStart + dur }
    if (isOccupied(newStart, newEnd)) return
    onStartChange(newStart)
    onEndChange(newEnd)
  }

  function handleBarTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const clickedMin = xToMinutes(e.touches[0].clientX)
    if (occupied.some(b => clickedMin >= b.start && clickedMin < b.end)) return
    const dur = endMinutes - startMinutes
    let newStart = clickedMin
    let newEnd = newStart + dur
    if (newEnd > TIMELINE_END_MIN) { newEnd = TIMELINE_END_MIN; newStart = TIMELINE_END_MIN - dur }
    if (newStart < TIMELINE_START_MIN) { newStart = TIMELINE_START_MIN; newEnd = newStart + dur }
    if (isOccupied(newStart, newEnd)) return
    onStartChange(newStart)
    onEndChange(newEnd)
  }

  return (
    <div>
      <div
        ref={barRef}
        className="relative h-8 rounded bg-muted/40 select-none cursor-pointer overflow-hidden"
        onMouseDown={handleBarMouseDown}
        onTouchStart={handleBarTouchStart}
      >
        {/* Existing bookings */}
        {activeBookings.map((b, i) => {
          const left = ((b.start - TIMELINE_START) / TIMELINE_RANGE) * 100
          const width = ((b.end - b.start) / TIMELINE_RANGE) * 100
          return (
            <div
              key={i}
              className={cn(
                "absolute top-0 h-full pointer-events-none",
                b.isPast ? "bg-slate-500/40" : "bg-rose-500/50",
              )}
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          )
        })}

        {/* Selection block */}
        <div
          className="absolute top-0 h-full bg-cyan-500 rounded cursor-grab active:cursor-grabbing"
          style={{ left: `${selLeft}%`, width: `${selWidth}%` }}
          onMouseDown={(e) => {
            e.stopPropagation()
            startInteraction("drag", e.clientX)
          }}
          onTouchStart={(e) => {
            e.stopPropagation()
            startInteraction("drag", e.touches[0].clientX)
          }}
        >
          {/* Left resize handle */}
          <div
            className="absolute left-0 top-0 h-full w-2 cursor-ew-resize z-10"
            onMouseDown={(e) => {
              e.stopPropagation()
              startInteraction("resize-left", e.clientX)
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
              startInteraction("resize-left", e.touches[0].clientX)
            }}
          />
          {/* Right resize handle */}
          <div
            className="absolute right-0 top-0 h-full w-2 cursor-ew-resize z-10"
            onMouseDown={(e) => {
              e.stopPropagation()
              startInteraction("resize-right", e.clientX)
            }}
            onTouchStart={(e) => {
              e.stopPropagation()
              startInteraction("resize-right", e.touches[0].clientX)
            }}
          />
        </div>

        {/* Current time indicator */}
        {showNow && (
          <div
            className="absolute top-0 h-full w-px bg-white/70 pointer-events-none"
            style={{ left: `${nowPct}%` }}
          />
        )}
      </div>

      <div className="relative h-5 mt-1">
        {hourMarkers.map((h) => {
          const pct = ((h - TIMELINE_START) / TIMELINE_RANGE) * 100
          return (
            <span
              key={h}
              className="absolute text-xs text-muted-foreground -translate-x-1/2"
              style={{ left: `${pct}%` }}
            >
              {h}
            </span>
          )
        })}
      </div>

      <div className="mt-1 space-y-1">
        {activeBookings.map((b, i) => {
          const fmt = (dec: number) => {
            const h = Math.floor(dec)
            const m = Math.round((dec % 1) * 60)
            return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
          }
          return (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className={cn(
                  "size-1.5 rounded-full shrink-0",
                  b.isPast ? "bg-slate-400" : "bg-rose-400",
                )}
              />
              <span>
                {fmt(b.start)}–{fmt(b.end)}
              </span>
              <span>·</span>
              <span>{b.person}</span>
              {b.isPast && (
                <>
                  <span>·</span>
                  <span className="text-slate-400">zakończone</span>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Time input ───────────────────────────────────────────────────────────────

function TimeInput({
  label,
  value,
  onChange,
  min = 0,
  max = 23 * 60 + 30,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <p className="text-xs text-muted-foreground self-start">{label}</p>
      <button
        onClick={() => onChange(Math.min(value + 30, max))}
        disabled={value >= max}
        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
      >
        <ChevronUp className="size-3.5" />
      </button>
      <span className="text-xl font-semibold tabular-nums">{formatMinutes(value)}</span>
      <button
        onClick={() => onChange(Math.max(value - 30, min))}
        disabled={value <= min}
        className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
      >
        <ChevronDown className="size-3.5" />
      </button>
    </div>
  )
}

// ─── Duration options ─────────────────────────────────────────────────────────

const DURATIONS = [
  { label: "30m", value: 30 },
  { label: "1h", value: 60 },
  { label: "1.5h", value: 90 },
  { label: "2h", value: 120 },
]

// ─── Filter types ─────────────────────────────────────────────────────────────

type TypeFilter = "all" | "room" | "desk" | "office"
type StatusFilter = "all" | "available" | "occupied"

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildIso(day: Date, totalMinutes: number): string {
  const d = new Date(day)
  d.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function BrowsePage() {
  const { data: rawResources = [], isLoading, isError } = useResources()
  const { data: allBookings = [] } = useBookings()
  const createBooking = useCreateBooking()
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  const initialResourceId = (location.state as { resourceId?: string } | null)?.resourceId ?? null

  const RESOURCES: Resource[] = useMemo(() => {
    const now = new Date()
    return rawResources.map((r) => {
      const activeBooking = allBookings.find(
        (b) =>
          b.resourceId === r.id &&
          (b.status === BookingStatus.Confirmed || b.status === BookingStatus.Pending) &&
          new Date(b.startTime) <= now &&
          new Date(b.endTime) > now,
      )
      const effectiveStatus =
        r.status === ResourceStatus.Maintenance
          ? ResourceStatus.Maintenance
          : activeBooking
            ? ResourceStatus.Booked
            : ResourceStatus.Available
      return {
        id: r.id,
        name: r.name,
        type: r.type,
        status: effectiveStatus,
        floor: r.floor,
        capacity: r.capacity,
        description: "",
        subtypeLabel: subtypeLabel(r.type),
        equipment: r.equipment.map((e) => e.name),
        bookings: [],
      }
    })
  }, [rawResources, allBookings])

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedId, setSelectedId] = useState<string | null>(initialResourceId)
  const [selectedDay, setSelectedDay] = useState(0)

  // Booking form state — single source of truth for timeline + panel
  const [startMinutes, setStartMinutes] = useState(10 * 60)
  const [endMinutes, setEndMinutes] = useState(11 * 60 + 30)
  const [participants, setParticipants] = useState(2)
  const [note, setNote] = useState("")
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [bookingDone, setBookingDone] = useState(false)

  const durationMin = endMinutes - startMinutes

  const selected = RESOURCES.find((r) => r.id === selectedId) ?? null

  const selectedResourceBookings = useMemo((): Booking[] => {
    if (!selectedId) return []
    const base = new Date()
    const day = new Date(base)
    day.setDate(base.getDate() + selectedDay)
    return allBookings
      .filter((b) => {
        if (b.resourceId !== selectedId) return false
        if (b.status === BookingStatus.Cancelled) return false
        const start = new Date(b.startTime)
        return (
          start.getFullYear() === day.getFullYear() &&
          start.getMonth() === day.getMonth() &&
          start.getDate() === day.getDate()
        )
      })
      .map((b) => {
        const start = new Date(b.startTime)
        const end = new Date(b.endTime)
        const now = new Date()
        return {
          start: start.getHours() + start.getMinutes() / 60,
          end: end.getHours() + end.getMinutes() / 60,
          person: b.userNameSurname,
          isPast: selectedDay === 0 && end <= now,
        }
      })
  }, [selectedId, selectedDay, allBookings])

  const isOverlapping = useMemo(
    () => selectedResourceBookings.some(b => startMinutes < b.end * 60 && endMinutes > b.start * 60),
    [startMinutes, endMinutes, selectedResourceBookings],
  )

  const filtered = useMemo(() => {
    return RESOURCES.filter((r) => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
      if (typeFilter === "room" && r.type !== ResourceType.Room) return false
      if (typeFilter === "desk" && r.type !== ResourceType.Desk) return false
      if (typeFilter === "office" && r.type !== ResourceType.Office) return false
      if (statusFilter === "available" && r.status !== ResourceStatus.Available) return false
      if (statusFilter === "occupied" && r.status === ResourceStatus.Available) return false
      return true
    })
  }, [search, typeFilter, statusFilter, RESOURCES])

  const availableCount = RESOURCES.filter((r) => r.status === ResourceStatus.Available).length

  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    return d
  })

  const selDay = days[selectedDay]
  const summaryDate = `${selDay.getDate()} ${POLISH_MONTHS[selDay.getMonth()]}`
  const durationH = Math.floor(durationMin / 60)
  const durationM = durationMin % 60
  const durationText = durationM === 0 ? `${durationH}h` : `${durationH}h ${durationM}m`

  function handleStartChange(v: number) {
    const newStart = Math.max(TIMELINE_START_MIN, Math.min(TIMELINE_END_MIN - MIN_DURATION, v))
    setStartMinutes(newStart)
    if (endMinutes < newStart + MIN_DURATION) setEndMinutes(newStart + MIN_DURATION)
  }

  function handleEndChange(v: number) {
    setEndMinutes(Math.min(TIMELINE_END_MIN, Math.max(startMinutes + MIN_DURATION, v)))
  }

  function selectResource(id: string) {
    setSelectedId((prev) => (prev === id ? null : id))
    setParticipants(2)
    setNote("")
    setSelectedDay(0)
    setStartMinutes(10 * 60)
    setEndMinutes(11 * 60 + 30)
    setBookingError(null)
    setBookingDone(false)
  }

  async function handleBooking() {
    if (!user || !selected) return
    setBookingError(null)
    setBookingDone(false)

    const dto: CreateBookingDto = {
      userId: user.id,
      resourceId: selected.id,
      startTime: buildIso(selDay, startMinutes),
      endTime: buildIso(selDay, endMinutes),
      participantCount: participants,
      note: note.trim() || undefined,
    }

    try {
      await createBooking.mutateAsync(dto)
      setBookingDone(true)
      setNote("")
      const nextStart = endMinutes + 30 <= TIMELINE_END_MIN - MIN_DURATION ? endMinutes : TIMELINE_START_MIN
      const dur = endMinutes - startMinutes
      setStartMinutes(nextStart)
      setEndMinutes(Math.min(nextStart + dur, TIMELINE_END_MIN))
    } catch (err) {
      const axiosErr = err as { response?: { data?: unknown } }
      const data = axiosErr?.response?.data
      setBookingError(typeof data === "string" ? data : "Nie udało się złożyć rezerwacji.")
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left panel (list) ── */}
      <div
        className={cn(
          "flex flex-col border-r border-border overflow-hidden transition-all duration-200",
          selected ? "w-96 shrink-0" : "flex-1",
        )}
      >
        {/* Header */}
        <div className="p-6 pb-4 shrink-0">
          <h1 className="text-xl font-semibold">Przeglądaj pomieszczenia</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {availableCount} wolnych z {RESOURCES.length}
          </p>
        </div>

        {/* Filters */}
        <div className="px-6 pb-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-0.5">
            {(
              [
                { key: "all", label: "Wszystkie" },
                { key: "room", label: "Sale" },
                { key: "desk", label: "Biurka" },
                { key: "office", label: "Pokoje" },
              ] as { key: TypeFilter; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTypeFilter(key)}
                className={cn(
                  "px-3 py-1 text-sm rounded-full transition-colors cursor-pointer",
                  typeFilter === key
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-0.5">
            {(
              [
                { key: "all", label: "Wszystkie" },
                { key: "available", label: "Wolne" },
                { key: "occupied", label: "Zajęte" },
              ] as { key: StatusFilter; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={cn(
                  "px-3 py-1 text-sm rounded-full transition-colors cursor-pointer",
                  statusFilter === key
                    ? "border border-border text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Resource list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Ładowanie…
            </div>
          )}
          {isError && !isLoading && (
            <div className="flex items-center justify-center py-12 text-sm text-rose-400">
              Nie udało się załadować zasobów
            </div>
          )}
          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
              Brak wyników
            </div>
          )}
          {filtered.map((r) => {
            const sc = statusConfig(r.status)
            const isActive = r.id === selectedId
            return (
              <div
                key={r.id}
                onClick={() => selectResource(r.id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 border-b border-border cursor-pointer hover:bg-muted/20 transition-colors relative",
                  isActive && "bg-muted/30",
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-500" />
                )}
                <div
                  className={cn(
                    "flex size-9 items-center justify-center rounded-lg shrink-0",
                    sc.icon,
                  )}
                >
                  {resourceIcon(r.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {r.subtypeLabel} · Piętro {r.floor} · {r.capacity} os.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium shrink-0">
                  <span className={cn("size-1.5 rounded-full", sc.dot)} />
                  <span className={sc.text}>{sc.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Right panel ── */}
      {!selected ? (
        <div className="flex-1 flex flex-col">
          {/* Search bar at top-right */}
          <div className="flex justify-end p-6 pb-4 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Szukaj..."
                className="pl-9 pr-3 py-2 text-sm bg-muted/30 border border-border rounded-lg w-56 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          {/* Empty state */}
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Search className="size-12 opacity-20" />
            <p className="text-sm">Wybierz pomieszczenie, aby zobaczyć szczegóły i zarezerwować</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* ── Detail view ── */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Room header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h2 className="text-2xl font-semibold">{selected.name}</h2>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      statusConfig(selected.status).text,
                    )}
                  >
                    <span
                      className={cn("size-1.5 rounded-full", statusConfig(selected.status).dot)}
                    />
                    {statusConfig(selected.status).label}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selected.subtypeLabel} · Piętro {selected.floor} · {selected.capacity} osób
                </p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="text-muted-foreground hover:text-foreground transition-colors mt-1"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground">{selected.description}</p>

            {/* Equipment */}
            {selected.equipment.length > 0 && (
              <div className="mt-5">
                <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                  Wyposażenie
                </p>
                <div className="flex flex-wrap gap-2">
                  {selected.equipment.map((eq) => (
                    <div
                      key={eq}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs"
                    >
                      {EQUIPMENT_ICONS[eq]}
                      <span>{eq}</span>
                      <ChevronDown className="size-3 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day picker */}
            <div className="mt-6">
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                Dzień
              </p>
              <div className="flex items-center gap-1.5">
                {days.map((d, i) => {
                  const name =
                    i === 0 ? "Dziś" : i === 1 ? "Jutro" : POLISH_DAYS[d.getDay()]
                  const isActive = i === selectedDay
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDay(i)}
                      className={cn(
                        "flex flex-col items-center min-w-12 py-2 px-2 rounded-full transition-colors cursor-pointer",
                        isActive
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30",
                      )}
                    >
                      <span className="text-xs">{name}</span>
                      <span className="text-base font-semibold leading-tight">{d.getDate()}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-6">
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-3">
                Dostępność · 8:00 – 20:00
              </p>
              <TimelineBar
                bookings={selectedResourceBookings}
                startMinutes={startMinutes}
                endMinutes={endMinutes}
                onStartChange={handleStartChange}
                onEndChange={handleEndChange}
              />
            </div>
          </div>

          {/* ── Booking form ── */}
          <div className="w-68 shrink-0 border-l border-border p-6 overflow-y-auto flex flex-col gap-4">
            <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
              Zarezerwuj
            </p>

            {/* Time */}
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                Godzina
              </p>
              <div className="flex items-start gap-4">
                <TimeInput
                  label="Od"
                  value={startMinutes}
                  min={TIMELINE_START_MIN}
                  max={TIMELINE_END_MIN - MIN_DURATION}
                  onChange={handleStartChange}
                />
                <TimeInput
                  label="Do"
                  value={endMinutes}
                  min={startMinutes + MIN_DURATION}
                  max={TIMELINE_END_MIN}
                  onChange={handleEndChange}
                />
              </div>
            </div>

            {/* Duration shortcuts */}
            <div className="flex gap-1.5">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => {
                    const newEnd = startMinutes + d.value
                    if (newEnd <= TIMELINE_END_MIN) {
                      setEndMinutes(newEnd)
                    } else {
                      const newStart = Math.max(TIMELINE_START_MIN, TIMELINE_END_MIN - d.value)
                      setStartMinutes(newStart)
                      setEndMinutes(TIMELINE_END_MIN)
                    }
                  }}
                  className={cn(
                    "flex-1 py-1.5 text-xs rounded-full border transition-colors cursor-pointer",
                    durationMin === d.value
                      ? "bg-cyan-500 border-cyan-500 text-white font-medium"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {/* Participants */}
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                Uczestnicy
              </p>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <Users className="size-4 text-muted-foreground" />
                  <span className="text-sm">
                    {participants} z {selected.capacity}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setParticipants(Math.max(1, participants - 1))}
                    className="size-6 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <span className="text-sm leading-none">−</span>
                  </button>
                  <button
                    onClick={() =>
                      setParticipants(Math.min(selected.capacity, participants + 1))
                    }
                    className="size-6 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <span className="text-sm leading-none">+</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Note */}
            <div>
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-2">
                Notatka
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="np. Spotkanie projektowe..."
                rows={3}
                className="w-full px-3 py-2 text-sm bg-muted/20 border border-border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
              />
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-muted/20 border border-border px-4 py-3">
              <p className="text-xs font-medium tracking-widest uppercase text-muted-foreground mb-1">
                Podsumowanie
              </p>
              <p className="text-sm">
                {summaryDate} · {formatMinutes(startMinutes)}–{formatMinutes(endMinutes)}
              </p>
              <p className="text-xs text-cyan-400 mt-0.5">{durationText}</p>
            </div>

            {/* Book button */}
            {bookingDone && (
              <p className="text-xs text-emerald-400 text-center">Rezerwacja złożona!</p>
            )}
            {bookingError && (
              <p className="text-xs text-rose-400 text-center">{bookingError}</p>
            )}
            {selected.status === ResourceStatus.Maintenance && (
              <p className="text-xs text-amber-400 text-center">Pomieszczenie jest w serwisie</p>
            )}
            <button
              onClick={handleBooking}
              disabled={createBooking.isPending || !user || endMinutes <= startMinutes || isOverlapping || selected.status === ResourceStatus.Maintenance}
              className="w-full py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createBooking.isPending ? "Rezerwowanie…" : "Zarezerwuj"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
