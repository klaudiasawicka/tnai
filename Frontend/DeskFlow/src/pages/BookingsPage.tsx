import { useState } from "react"
import { BookingStatus } from "@/types/bookingType"
import type { BookingDto } from "@/types/bookingType"
import { ResourceType } from "@/types/resourceType"
import { cn } from "@/lib/utils"

interface MockBooking extends BookingDto {
  resourceType: ResourceType
  resourceFloor: number
}

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

function resourceTypeLabel(type: ResourceType) {
  if (type === ResourceType.Desk) return "Biurko"
  if (type === ResourceType.Room) return "Sala"
  return "Pokój"
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

const upcoming: MockBooking[] = [
  {
    id: "1",
    userId: "1",
    userNameSurname: "Anna Kowalska",
    resourceId: "r1",
    resourceName: "Sala Alfa",
    resourceType: ResourceType.Room,
    resourceFloor: 3,
    startTime: "2026-06-05T13:00:00",
    endTime: "2026-06-05T14:30:00",
    totalPrice: 0,
    participantCount: 5,
    status: BookingStatus.Cancelled,
    createdAt: "2026-06-01T10:00:00",
  },
  {
    id: "2",
    userId: "1",
    userNameSurname: "Anna Kowalska",
    resourceId: "r2",
    resourceName: "Biurko #12",
    resourceType: ResourceType.Desk,
    resourceFloor: 2,
    startTime: "2026-06-05T12:00:00",
    endTime: "2026-06-05T14:30:00",
    totalPrice: 0,
    participantCount: 1,
    status: BookingStatus.Cancelled,
    createdAt: "2026-06-01T09:00:00",
  },
  {
    id: "3",
    userId: "1",
    userNameSurname: "Anna Kowalska",
    resourceId: "r3",
    resourceName: "Sala Beta",
    resourceType: ResourceType.Room,
    resourceFloor: 3,
    startTime: "2026-06-06T10:00:00",
    endTime: "2026-06-06T11:30:00",
    totalPrice: 0,
    participantCount: 8,
    status: BookingStatus.Cancelled,
    createdAt: "2026-06-01T11:00:00",
  },
  {
    id: "4",
    userId: "1",
    userNameSurname: "Anna Kowalska",
    resourceId: "r4",
    resourceName: "Biurko #07",
    resourceType: ResourceType.Desk,
    resourceFloor: 2,
    startTime: "2026-06-07T08:00:00",
    endTime: "2026-06-07T12:00:00",
    totalPrice: 0,
    participantCount: 1,
    status: BookingStatus.Cancelled,
    createdAt: "2026-06-02T08:00:00",
  },
  {
    id: "5",
    userId: "1",
    userNameSurname: "Anna Kowalska",
    resourceId: "r5",
    resourceName: "Pokój Ciszy",
    resourceType: ResourceType.Office,
    resourceFloor: 4,
    startTime: "2026-06-08T14:00:00",
    endTime: "2026-06-08T16:00:00",
    totalPrice: 0,
    participantCount: 1,
    status: BookingStatus.Cancelled,
    createdAt: "2026-06-02T09:00:00",
  },
]

const history: MockBooking[] = [
  {
    id: "6",
    userId: "1",
    userNameSurname: "Anna Kowalska",
    resourceId: "r1",
    resourceName: "Sala Alfa",
    resourceType: ResourceType.Room,
    resourceFloor: 3,
    startTime: "2026-05-28T09:00:00",
    endTime: "2026-05-28T11:00:00",
    totalPrice: 0,
    participantCount: 4,
    status: BookingStatus.Past,
    createdAt: "2026-05-20T10:00:00",
  },
  {
    id: "7",
    userId: "1",
    userNameSurname: "Anna Kowalska",
    resourceId: "r2",
    resourceName: "Biurko #12",
    resourceType: ResourceType.Desk,
    resourceFloor: 2,
    startTime: "2026-05-25T10:00:00",
    endTime: "2026-05-25T12:00:00",
    totalPrice: 0,
    participantCount: 1,
    status: BookingStatus.Past,
    createdAt: "2026-05-18T09:00:00",
  },
  {
    id: "8",
    userId: "1",
    userNameSurname: "Anna Kowalska",
    resourceId: "r6",
    resourceName: "Sala Gamma",
    resourceType: ResourceType.Room,
    resourceFloor: 1,
    startTime: "2026-05-20T13:00:00",
    endTime: "2026-05-20T15:00:00",
    totalPrice: 0,
    participantCount: 10,
    status: BookingStatus.Past,
    createdAt: "2026-05-14T08:00:00",
  },
  {
    id: "9",
    userId: "1",
    userNameSurname: "Anna Kowalska",
    resourceId: "r4",
    resourceName: "Biurko #07",
    resourceType: ResourceType.Desk,
    resourceFloor: 2,
    startTime: "2026-05-15T08:00:00",
    endTime: "2026-05-15T10:00:00",
    totalPrice: 0,
    participantCount: 1,
    status: BookingStatus.Cancelled,
    createdAt: "2026-05-10T08:00:00",
  },
]

type Tab = "upcoming" | "history"

export function BookingsPage() {
  const [tab, setTab] = useState<Tab>("upcoming")
  const bookings = tab === "upcoming" ? upcoming : history
  const activeCount = upcoming.filter(
    (b) => b.status === BookingStatus.Confirmed || b.status === BookingStatus.Pending,
  ).length

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

      {bookings.map((b) => (
        <div
          key={b.id}
          className="flex items-center gap-4 py-4 border-b border-border"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{b.resourceName}</p>
            <p className="text-xs text-muted-foreground">
              {resourceTypeLabel(b.resourceType)} · P{b.resourceFloor}
            </p>
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
