import { useState, useMemo } from "react"
import { Users, Briefcase, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { useResources } from "@/hooks/useResources"
import { useBookings } from "@/hooks/useBookings"
import { ResourceStatus, ResourceType } from "@/types/resourceType"
import { BookingStatus } from "@/types/bookingType"

type RoomStatus = "available" | "occupied" | "maintenance"
type Filter = "all" | "available" | "occupied" | "maintenance"

interface RoomEntry {
  id: string
  name: string
  subtype: "sala" | "biurko" | "pokoj"
  floor: number
  capacity: number
  currentReservation: string | null
  reservedUntil: string | null
  status: RoomStatus
}

const STATUS_CONFIG = {
  available:   { label: "Wolne",  dot: "bg-emerald-400", text: "text-emerald-400" },
  occupied:    { label: "Zajęte", dot: "bg-red-400",     text: "text-red-400" },
  maintenance: { label: "Serwis", dot: "bg-amber-400",   text: "text-amber-400" },
} as const

function resourceTypeToSubtype(type: ResourceType): "sala" | "biurko" | "pokoj" {
  if (type === ResourceType.Room) return "sala"
  if (type === ResourceType.Desk) return "biurko"
  return "pokoj"
}

function resourceStatusToRoomStatus(status: ResourceStatus): RoomStatus {
  if (status === ResourceStatus.Available) return "available"
  if (status === ResourceStatus.Maintenance) return "maintenance"
  return "occupied"
}

function formatEndTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function subtypeLabel(subtype: string) {
  if (subtype === "sala")   return "Sala konferencyjna"
  if (subtype === "biurko") return "Hot-desk"
  return "Pokój pracy cichej"
}

function SubtypeIcon({ subtype }: { subtype: string }) {
  if (subtype === "sala")   return <Users className="size-4" />
  if (subtype === "biurko") return <Briefcase className="size-4" />
  return <BookOpen className="size-4" />
}

function StatCard({ label, value, dotClass }: { label: string; value: number; dotClass: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className={cn("size-2 rounded-full shrink-0", dotClass)} />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-4xl font-bold">{value}</span>
    </div>
  )
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",         label: "Wszystkie" },
  { key: "available",   label: "Wolne" },
  { key: "occupied",    label: "Zajęte" },
  { key: "maintenance", label: "Serwis" },
]

export function StatusBiuraPage() {
  const [filter, setFilter] = useState<Filter>("all")
  const { data: resources = [], isLoading: loadingResources } = useResources()
  const { data: allBookings = [], isLoading: loadingBookings } = useBookings()

  const rooms = useMemo<RoomEntry[]>(() => {
    const now = new Date()
    return resources.map((r) => {
      const activeBooking = allBookings.find(
        (b) =>
          b.resourceId === r.id &&
          (b.status === BookingStatus.Confirmed || b.status === BookingStatus.Pending) &&
          new Date(b.startTime) <= now &&
          new Date(b.endTime) >= now,
      )
      const dynamicStatus: RoomStatus =
        r.status === ResourceStatus.Maintenance
          ? "maintenance"
          : activeBooking
            ? "occupied"
            : "available"
      return {
        id: r.id,
        name: r.name,
        subtype: resourceTypeToSubtype(r.type),
        floor: r.floor,
        capacity: r.capacity,
        currentReservation: activeBooking?.userNameSurname ?? null,
        reservedUntil: activeBooking ? formatEndTime(activeBooking.endTime) : null,
        status: dynamicStatus,
      }
    })
  }, [resources, allBookings])

  const totalBookingsToday = useMemo(() => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)
    return allBookings.filter((b) => {
      const start = new Date(b.startTime)
      return start >= todayStart && start <= todayEnd
    }).length
  }, [allBookings])

  const counts = {
    all:         rooms.length,
    available:   rooms.filter((r) => r.status === "available").length,
    occupied:    rooms.filter((r) => r.status === "occupied").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
  }

  const filtered = filter === "all" ? rooms : rooms.filter((r) => r.status === filter)
  const isLoading = loadingResources || loadingBookings

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-8 pt-7 pb-5 shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Status biura</h1>
          <p className="text-sm text-muted-foreground mt-1">Widok na żywo</p>
        </div>
        <div className="flex gap-1 mt-1">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                filter === key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 px-8 pb-6 shrink-0">
        <StatCard label="Wszystkie"       value={counts.all}            dotClass="bg-foreground" />
        <StatCard label="Wolne"           value={counts.available}      dotClass="bg-emerald-400" />
        <StatCard label="Zajęte"          value={counts.occupied}       dotClass="bg-red-400" />
        <StatCard label="Serwis"          value={counts.maintenance}    dotClass="bg-amber-400" />
        <StatCard label="Dziś rezerwacji" value={totalBookingsToday}    dotClass="bg-cyan-400" />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="grid grid-cols-[1fr_140px_140px_1fr_160px] px-6 py-3 border-b border-border">
            {(["Pomieszczenie", "Piętro", "Pojemność", "Aktualna rezerwacja", "Status"] as const).map((h) => (
              <span key={h} className="text-xs font-medium text-muted-foreground uppercase tracking-wide last:text-right">
                {h}
              </span>
            ))}
          </div>

          {isLoading && (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">Ładowanie…</div>
          )}

          {!isLoading && filtered.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">Brak wyników</div>
          )}

          {filtered.map((room) => {
            const sc = STATUS_CONFIG[room.status]
            return (
              <div
                key={room.id}
                className="grid grid-cols-[1fr_140px_140px_1fr_160px] px-6 py-4 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
                    <SubtypeIcon subtype={room.subtype} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{room.name}</p>
                    <p className="text-xs text-muted-foreground">{subtypeLabel(room.subtype)}</p>
                  </div>
                </div>

                <span className="text-sm">Piętro {room.floor}</span>

                <span className="text-sm">{room.capacity} os.</span>

                <span className="text-sm">
                  {room.status === "maintenance" ? (
                    <span className="text-amber-400">W trakcie serwisu</span>
                  ) : room.currentReservation ? (
                    <>
                      <span className="font-medium">{room.currentReservation}</span>
                      <span className="text-muted-foreground"> do </span>
                      <span className="text-amber-400">{room.reservedUntil}</span>
                    </>
                  ) : (
                    <span className="text-emerald-400">Brak aktywnej rezerwacji</span>
                  )}
                </span>

                <div className="flex items-center justify-end gap-2">
                  <span className={cn("size-2 rounded-full", sc.dot)} />
                  <span className={cn("text-sm font-medium", sc.text)}>{sc.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
