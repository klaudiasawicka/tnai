export const ResourceType = {
  Desk: 0,
  Room: 1,
  Office: 2,
} as const
export type ResourceType = (typeof ResourceType)[keyof typeof ResourceType]

export const ResourceStatus = {
  Available: 0,
  Booked: 1,
  Occupied: 2,
  Maintenance: 3,
} as const
export type ResourceStatus =
  (typeof ResourceStatus)[keyof typeof ResourceStatus]

export interface EquipmentDto {
  id: string
  name: string
}
export interface CreateEquipmentDto {
  name: string
}

export interface ResourceDto {
  id: string
  name: string
  type: ResourceType
  status: ResourceStatus
  floor: number
  capacity: number
  pricePerHour: number
  imageUrl?: string
  equipment: EquipmentDto[]
}
