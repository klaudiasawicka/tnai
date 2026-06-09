import { apiClient } from './axiosInstance'
import type { UserDto } from '@/auth/authType'

export const usersApi = {
  getAll: async (): Promise<UserDto[]> => {
    const res = await apiClient.get<UserDto[]>('/api/users')
    return res.data
  },

  getById: async (id: string): Promise<UserDto> => {
    const res = await apiClient.get<UserDto>(`/api/users/${id}`)
    return res.data
  },
}
