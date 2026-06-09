import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/api/usersApi'

export const userKeys = {
  all: ['users'] as const,
  detail: (id: string) => ['users', id] as const,
}

// Admin-only – UsersController is protected by [Authorize(Roles = "Admin")]
export function useUsers() {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: usersApi.getAll,
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  })
}
