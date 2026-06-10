import { apiClient } from './axiosInstance'
import type { BookingDto, CreateBookingDto } from '@/types/bookingType'
import type { BookingStatus } from '@/types/bookingType'

export const bookingsApi = {
  getAll: async (): Promise<BookingDto[]> => {
    const res = await apiClient.get<BookingDto[]>('/api/bookings')
    return res.data
  },

  getMy: async (): Promise<BookingDto[]> => {
    const res = await apiClient.get<BookingDto[]>('/api/bookings/my')
    return res.data
  },

  getById: async (id: string): Promise<BookingDto> => {
    const res = await apiClient.get<BookingDto>(`/api/bookings/${id}`)
    return res.data
  },

  // Backend accepts BookingDto shape; we send only the fields needed for creation
  create: async (data: CreateBookingDto): Promise<BookingDto> => {
    const res = await apiClient.post<BookingDto>('/api/bookings', data)
    return res.data
  },

  // PATCH /api/bookings/{id}/status – body is just the enum integer value
  updateStatus: async (id: string, status: BookingStatus): Promise<void> => {
    await apiClient.patch(`/api/bookings/${id}/status`, status)
  },

  confirm: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/bookings/${id}/confirm`)
  },

  cancel: async (id: string): Promise<void> => {
    await apiClient.patch(`/api/bookings/${id}/cancel`)
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/bookings/${id}`)
  },
}
