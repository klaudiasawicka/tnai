export const BookingStatus = {
  Confirmed: 0,
  Pending: 1,
  Past: 2,
  Cancelled: 3,
} as const
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus]

export interface BookingDto {
  id: string
  userId: string
  userNameSurname: string
  resourceId: string
  resourceName: string
  startTime: string
  endTime: string
  totalPrice: number
  participantCount: number
  note?: string
  status: BookingStatus
  createdAt: string
}

export interface CreateBookingDto {
  userId: string
  resourceId: string
  startTime: string
  endTime: string
  participantCount: number
  note?: string
}
