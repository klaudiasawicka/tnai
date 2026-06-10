import { useState, useMemo } from "react"
import {
  Users, Briefcase, BookOpen,
  Search, Plus, Pencil, Trash2,
  Wifi, Monitor, Wind, PenLine,
  X, Check, AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useResources,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
} from "@/hooks/useResources"
import { ResourceType, ResourceStatus } from "@/types/resourceType"
import type { CreateResourceDto, UpdateResourceDto, ResourceDto } from "@/types/resourceType"

// ─── Types ───────────────────────────────────────────────────────────────────

type RoomSubtype = "sala" | "biurko" | "pokoj"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function subtypeToResourceType(subtype: RoomSubtype): ResourceType {
  if (subtype === "sala") return ResourceType.Room
  if (subtype === "biurko") return ResourceType.Desk
  return ResourceType.Office
}

function resourceTypeToSubtype(type: ResourceType): RoomSubtype {
  if (type === ResourceType.Room) return "sala"
  if (type === ResourceType.Desk) return "biurko"
  return "pokoj"
}

function amenityIcon(name: string) {
  switch (name) {
    case "WiFi":         return <Wifi className="size-3.5" />
    case "Projektor":    return <Monitor className="size-3.5" />
    case "Klimatyzacja": return <Wind className="size-3.5" />
    case "Tablica":      return <PenLine className="size-3.5" />
    case "Monitor":      return <Monitor className="size-3.5" />
    default:             return null
  }
}

function subtypeShortLabel(subtype: RoomSubtype) {
  if (subtype === "sala")   return "Sala"
  if (subtype === "biurko") return "Biurko"
  return "Pokój"
}

function SubtypeIcon({ subtype }: { subtype: RoomSubtype }) {
  if (subtype === "sala")   return <Users className="size-4" />
  if (subtype === "biurko") return <Briefcase className="size-4" />
  return <BookOpen className="size-4" />
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        on ? "bg-cyan-500" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
          on ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface FormState {
  name: string
  type: RoomSubtype
  floor: string
  capacity: string
  pricePerHour: string
  amenities: string[]
  available: boolean
}

const ALL_AMENITIES = ["WiFi", "Projektor", "Klimatyzacja", "Tablica"] as const

const TYPE_OPTIONS: { key: RoomSubtype; label: string; icon: React.ReactNode }[] = [
  { key: "sala",   label: "Sala konferencyjna", icon: <Users className="size-5" /> },
  { key: "biurko", label: "Hot-desk",           icon: <Briefcase className="size-5" /> },
  { key: "pokoj",  label: "Pokój ciszy",        icon: <BookOpen className="size-5" /> },
]

interface ModalProps {
  onClose: () => void
  onSubmit: (dto: CreateResourceDto) => void
  initial?: ResourceDto
}

function PomieszczeniaModal({ onClose, onSubmit, initial }: ModalProps) {
  const [form, setForm] = useState<FormState>({
    name: initial?.name ?? "",
    type: initial ? resourceTypeToSubtype(initial.type) : "sala",
    floor: initial ? String(initial.floor) : "3",
    capacity: initial ? String(initial.capacity) : "8",
    pricePerHour: initial ? String(initial.pricePerHour) : "50",
    amenities: initial ? initial.equipment.map((e) => e.name) : ["WiFi"],
    available: initial ? initial.status === ResourceStatus.Available : true,
  })

  function toggleAmenity(a: string) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }))
  }

  function handleSubmit() {
    if (!form.name.trim()) return
    onSubmit({
      name: form.name.trim(),
      type: subtypeToResourceType(form.type),
      status: form.available ? ResourceStatus.Available : ResourceStatus.Maintenance,
      floor: Math.max(1, parseInt(form.floor) || 1),
      capacity: Math.max(1, parseInt(form.capacity) || 1),
      pricePerHour: Math.max(0, parseFloat(form.pricePerHour) || 0),
      equipmentIds: initial ? initial.equipment.map((e) => e.id) : [],
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            {initial ? "Edytuj pomieszczenie" : "Nowe pomieszczenie"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Nazwa */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Nazwa
            </label>
            <input
              type="text"
              placeholder="np. Sala Epsilon"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
            />
          </div>

          {/* Typ */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Typ
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TYPE_OPTIONS.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setForm((f) => ({ ...f, type: key }))}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-colors",
                    form.type === key
                      ? "border-cyan-500 bg-cyan-500/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
                  )}
                >
                  {icon}
                  <span className="text-xs font-medium leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Piętro + Pojemność + Cena */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Piętro
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={form.floor}
                onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Pojemność
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.capacity}
                onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Cena/h (zł)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.pricePerHour}
                onChange={(e) => setForm((f) => ({ ...f, pricePerHour: e.target.value }))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
              />
            </div>
          </div>

          {/* Udogodnienia */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Udogodnienia
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_AMENITIES.map((a) => {
                const checked = form.amenities.includes(a)
                return (
                  <label
                    key={a}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors select-none",
                      checked
                        ? "border-cyan-500 bg-cyan-500/10"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleAmenity(a)}
                    />
                    <div
                      className={cn(
                        "size-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                        checked ? "bg-cyan-500 border-cyan-500" : "border-muted-foreground"
                      )}
                    >
                      {checked && <Check className="size-3 text-white" />}
                    </div>
                    <span className="text-sm">{a}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Toggle dostępności */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-sm font-medium">Dostępne do rezerwacji</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Wyłącz gdy pomieszczenie jest w serwisie
              </p>
            </div>
            <Toggle on={form.available} onToggle={() => setForm((f) => ({ ...f, available: !f.available }))} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground transition-colors"
          >
            Anuluj
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim()}
            className="flex-1 rounded-full bg-cyan-500 py-2.5 text-sm font-semibold text-white hover:bg-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {initial ? "Zapisz zmiany" : "Dodaj pomieszczenie"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function ZarzadzaniePage() {
  const { data: rawResources = [], isLoading } = useResources()
  const createResource = useCreateResource()
  const updateResource = useUpdateResource()
  const deleteResource = useDeleteResource()

  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const rooms = useMemo(
    () =>
      rawResources.map((r) => ({
        id: r.id,
        name: r.name,
        subtype: resourceTypeToSubtype(r.type),
        floor: r.floor,
        capacity: r.capacity,
        amenities: r.equipment.map((e) => e.name),
        active: r.status === ResourceStatus.Available,
      })),
    [rawResources],
  )

  const filtered = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  )

  function handleToggle(id: string) {
    const resource = rawResources.find((r) => r.id === id)
    if (!resource) return
    updateResource.mutate({
      id,
      data: {
        name: resource.name,
        type: resource.type,
        status:
          resource.status === ResourceStatus.Available
            ? ResourceStatus.Maintenance
            : ResourceStatus.Available,
        floor: resource.floor,
        capacity: resource.capacity,
        pricePerHour: resource.pricePerHour,
        imageUrl: resource.imageUrl,
        equipmentIds: resource.equipment.map((e) => e.id),
      } as UpdateResourceDto,
    })
  }

  function handleDelete(id: string) {
    if (!window.confirm("Czy na pewno chcesz usunąć to pomieszczenie?")) return
    setDeleteError(null)
    deleteResource.mutate(id, {
      onError: () => {
        setDeleteError("Nie udało się usunąć pomieszczenia. Może być powiązane z istniejącymi rezerwacjami.")
      },
    })
  }

  function handleModalSubmit(dto: CreateResourceDto) {
    if (editingId) {
      updateResource.mutate({ id: editingId, data: dto as UpdateResourceDto })
    } else {
      createResource.mutate(dto)
    }
  }

  function openAdd() {
    setEditingId(null)
    setShowModal(true)
  }

  function openEdit(id: string) {
    setEditingId(id)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingId(null)
  }

  const editingResource = editingId ? rawResources.find((r) => r.id === editingId) : undefined

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-8 pt-7 pb-2 shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Zarządzanie pomieszczeniami</h1>
          <p className="text-sm text-muted-foreground mt-1">{rooms.length} pomieszczeń</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Szukaj..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow"
            />
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600 transition-colors"
          >
            <Plus className="size-4" />
            Dodaj pomieszczenie
          </button>
        </div>
      </div>

      {/* Error banner */}
      {deleteError && (
        <div className="mx-8 mt-3 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 shrink-0">
          <AlertCircle className="size-4 shrink-0" />
          <span>{deleteError}</span>
          <button
            onClick={() => setDeleteError(null)}
            className="ml-auto rounded p-0.5 hover:bg-red-500/20 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Nazwa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  Pojemność
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Udogodnienia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Aktywne
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-sm text-muted-foreground text-center">
                    Ładowanie…
                  </td>
                </tr>
              )}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-sm text-muted-foreground text-center">
                    Brak pomieszczeń spełniających kryteria wyszukiwania.
                  </td>
                </tr>
              )}

              {filtered.map((room) => (
                <tr
                  key={room.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  {/* Nazwa */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
                        <SubtypeIcon subtype={room.subtype} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{room.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {subtypeShortLabel(room.subtype)} · P{room.floor}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Pojemność */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm">{room.capacity} os.</span>
                  </td>

                  {/* Udogodnienia */}
                  <td className="px-6 py-4">
                    {room.amenities.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {room.amenities.map((a) => (
                          <span
                            key={a}
                            className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                          >
                            {amenityIcon(a)}
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Toggle */}
                  <td className="px-6 py-4">
                    <Toggle on={room.active} onToggle={() => handleToggle(room.id)} />
                  </td>

                  {/* Akcje */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEdit(room.id)}
                        className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Pencil className="size-3.5" />
                        Edytuj
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        disabled={deleteResource.isPending}
                        className="rounded-md p-1.5 text-red-400 hover:text-red-500 hover:bg-muted transition-colors disabled:opacity-40"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <PomieszczeniaModal
          onClose={closeModal}
          onSubmit={handleModalSubmit}
          initial={editingResource}
        />
      )}
    </div>
  )
}
