import { apiClient } from './axiosInstance'
import type {
  ResourceDto,
  CreateResourceDto,
  UpdateResourceDto,
  ResourceFilters,
} from '@/types/resourceType'

export const resourcesApi = {
  getAll: async (filters?: ResourceFilters): Promise<ResourceDto[]> => {
    const res = await apiClient.get<ResourceDto[]>('/api/resources', {
      params: filters,
    })
    return res.data
  },

  getById: async (id: string): Promise<ResourceDto> => {
    const res = await apiClient.get<ResourceDto>(`/api/resources/${id}`)
    return res.data
  },

  create: async (data: CreateResourceDto): Promise<ResourceDto> => {
    const res = await apiClient.post<ResourceDto>('/api/resources', data)
    return res.data
  },

  update: async (id: string, data: UpdateResourceDto): Promise<ResourceDto> => {
    const res = await apiClient.put<ResourceDto>(`/api/resources/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/resources/${id}`)
  },
}
