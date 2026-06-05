import { useState, useMemo } from "react"
import { ResourceType, ResourceStatus } from "@/types/resourceType"
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

// ─── Mock data ────────────────────────────────────────────────────────────────

const RESOURCES: Resource[] = [
  {
    id: "r1",
    name: "Sala Alfa",
    type: ResourceType.Room,
    status: ResourceStatus.Occupied,
    floor: 3,
    capacity: 12,
    description: 'Sala konferencyjna z ekranem 85" i systemem wideokonferencyjnym Cisco.',
    subtypeLabel: "Sala konferencyjna",
    equipment: ["WiFi", "Projektor", "Klimatyzacja", "Tablica"],
    bookings: [{ start: 9, end: 10.5, person: "Marek Wiśniewski" }],
  },
  {
    id: "r2",
    name: "Sala Beta",
    type: ResourceType.Room,
    status: ResourceStatus.Available,
    floor: 3,
    capacity: 8,
    description: "Sala konferencyjna z projektorem i tablicą interaktywną. Idealna na spotkania do 8 osób.",
    subtypeLabel: "Sala konferencyjna",
    equipment: ["WiFi", "Projektor", "Tablica"],
    bookings: [{ start: 14, end: 16, person: "Ewa Nowak" }],
  },
  {
    id: "r3",
    name: "Biurko #12",
    type: ResourceType.Desk,
    status: ResourceStatus.Occupied,
    floor: 2,
    capacity: 1,
    description: "Biurko przy oknie z dostępem do monitora zewnętrznego i regulowaną wysokością blatu.",
    subtypeLabel: "Hot-desk",
    equipment: ["WiFi", "Monitor"],
    bookings: [{ start: 8, end: 17, person: "Jan Kowalski" }],
  },
  {
    id: "r4",
    name: "Pokój Ciszy",
    type: ResourceType.Office,
    status: ResourceStatus.Available,
    floor: 4,
    capacity: 2,
    description: "Wyciszony pokój pracy indywidualnej lub w parze. Brak rozmów telefonicznych.",
    subtypeLabel: "Pokój pracy cichej",
    equipment: ["WiFi"],
    bookings: [],
  },
  {
    id: "r5",
    name: "Sala Delta",
    type: ResourceType.Room,
    status: ResourceStatus.Maintenance,
    floor: 3,
    capacity: 16,
    description: "Duża sala szkoleniowa z układem klasowym. Aktualnie w trakcie przeglądu technicznego.",
    subtypeLabel: "Sala konferencyjna",
    equipment: ["WiFi", "Projektor", "Klimatyzacja", "Tablica"],
    bookings: [],
  },
  {
    id: "r6",
    name: "Biurko #07",
    type: ResourceType.Desk,
    status: ResourceStatus.Available,
    floor: 2,
    capacity: 1,
    description: "Biurko w strefie open space z ergonomicznym krzesłem, blisko kuchni.",
    subtypeLabel: "Hot-desk",
    equipment: ["WiFi"],
    bookings: [],
  },
  {
    id: "r7",
    name: "Sala Gamma",
    type: ResourceType.Room,
    status: ResourceStatus.Occupied,
    floor: 5,
    capacity: 6,
    description: "Kameralna sala spotkań z widokiem na park. Wyposażona w ekran i system nagłośnienia.",
    subtypeLabel: "Sala konferencyjna",
    equipment: ["WiFi", "Monitor", "Tablica"],
    bookings: [{ start: 11, end: 13, person: "Piotr Zając" }],
  },
  {
    id: "r8",
    name: "Biurko #03",
    type: ResourceType.Desk,
    status: ResourceStatus.Available,
    floor: 2,
    capacity: 1,
    description: "Biurko przy ścianie z regulowaną wysokością blatu i dodatkowym monitorem.",
    subtypeLabel: "Hot-desk",
    equipment: ["WiFi", "Monitor"],
    bookings: [],
  },
]

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

function TimelineBar({ bookings, selectedDay }: { bookings: Booking[]; selectedDay: number }) {
  const activeBookings = selectedDay === 0 ? bookings : []
  const now = new Date()
  const nowHour = now.getHours() + now.getMinutes() / 60
  const nowPct = ((nowHour - TIMELINE_START) / TIMELINE_RANGE) * 100
  const showNow = nowHour >= TIMELINE_START && nowHour <= TIMELINE_END

  const hourMarkers = [8, 10, 12, 14, 16, 18, 20]

  return (
    <div>
      <div className="relative h-8 rounded overflow-hidden bg-muted/40">
        {activeBookings.map((b, i) => {
          const left = ((b.start - TIMELINE_START) / TIMELINE_RANGE) * 100
          const width = ((b.end - b.start) / TIMELINE_RANGE) * 100
          return (
            <div
              key={i}
              className="absolute top-0 h-full bg-cyan-500/70"
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          )
        })}
        {showNow && (
          <div
            className="absolute top-0 h-full w-px bg-white/70"
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
              <span className="size-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>
                {fmt(b.start)}–{fmt(b.end)}
              </span>
              <span>·</span>
              <span>{b.person}</span>
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
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <p className="text-xs text-muted-foreground self-start">{label}</p>
      <button
        onClick={() => onChange(Math.min(value + 30, 23 * 60 + 30))}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronUp className="size-3.5" />
      </button>
      <span className="text-xl font-semibold tabular-nums">{formatMinutes(value)}</span>
      <button
        onClick={() => onChange(Math.max(value - 30, 0))}
        className="text-muted-foreground hover:text-foreground transition-colors"
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

// ─── Main page ────────────────────────────────────────────────────────────────

export function BrowsePage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState(0)

  // Booking form state
  const [startMinutes, setStartMinutes] = useState(10 * 60)
  const [endMinutes, setEndMinutes] = useState(11 * 60 + 30)
  const [participants, setParticipants] = useState(2)
  const [note, setNote] = useState("")

  const durationMin = endMinutes - startMinutes

  const selected = RESOURCES.find((r) => r.id === selectedId) ?? null

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
  }, [search, typeFilter, statusFilter])

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

  function selectResource(id: string) {
    setSelectedId((prev) => (prev === id ? null : id))
    setParticipants(2)
    setNote("")
    setSelectedDay(0)
    setStartMinutes(10 * 60)
    setEndMinutes(11 * 60 + 30)
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
                        "flex flex-col items-center min-w-[48px] py-2 px-2 rounded-lg transition-colors cursor-pointer",
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
              <TimelineBar bookings={selected.bookings} selectedDay={selectedDay} />
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
                  onChange={(v) => {
                    setStartMinutes(v)
                    if (endMinutes <= v) setEndMinutes(v + 30)
                  }}
                />
                <TimeInput
                  label="Do"
                  value={endMinutes}
                  onChange={(v) => setEndMinutes(Math.max(startMinutes + 30, v))}
                />
              </div>
            </div>

            {/* Duration shortcuts */}
            <div className="flex gap-1.5">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setEndMinutes(startMinutes + d.value)}
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
            <button className="w-full py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white text-sm font-semibold transition-colors cursor-pointer">
              Zarezerwuj
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
