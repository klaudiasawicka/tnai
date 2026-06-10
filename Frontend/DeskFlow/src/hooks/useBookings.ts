import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '@/api/bookingsApi'
import type { CreateBookingDto, BookingStatus } from '@/types/bookingType'

export const bookingKeys = {
  all: ['bookings'] as const,
  my: ['bookings', 'my'] as const,
  detail: (id: string) => ['bookings', id] as const,
}

// Admin/Manager: all bookings
export function useBookings() {
  return useQuery({
    queryKey: bookingKeys.all,
    queryFn: bookingsApi.getAll,
  })
}

// Current user's bookings
export function useMyBookings() {
  return useQuery({
    queryKey: bookingKeys.my,
    queryFn: bookingsApi.getMy,
  })
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingsApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateBooking() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBookingDto) => bookingsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: bookingKeys.all })
      qc.invalidateQueries({ queryKey: bookingKeys.my })
    },
  })
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      bookingsApi.updateStatus(id, status),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: bookingKeys.all })
      qc.invalidateQueries({ queryKey: bookingKeys.my })
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) })
      qc.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}

export function useConfirmBooking() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bookingsApi.confirm(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: bookingKeys.all })
      qc.invalidateQueries({ queryKey: bookingKeys.my })
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) })
    },
  })
}

export function useCancelBooking() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bookingsApi.cancel(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: bookingKeys.all })
      qc.invalidateQueries({ queryKey: bookingKeys.my })
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) })
    },
  })
}

export function useDeleteBooking() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bookingsApi.delete(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: bookingKeys.all })
      qc.invalidateQueries({ queryKey: bookingKeys.my })
      qc.removeQueries({ queryKey: bookingKeys.detail(id) })
      qc.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}
