import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resourcesApi } from '@/api/resourcesApi'
import type { CreateResourceDto, UpdateResourceDto, ResourceFilters } from '@/types/resourceType'

export const resourceKeys = {
  all: ['resources'] as const,
  list: (filters?: ResourceFilters) => ['resources', 'list', filters] as const,
  detail: (id: string) => ['resources', id] as const,
}

export function useResources(filters?: ResourceFilters) {
  return useQuery({
    queryKey: resourceKeys.list(filters),
    queryFn: () => resourcesApi.getAll(filters),
  })
}

export function useResource(id: string) {
  return useQuery({
    queryKey: resourceKeys.detail(id),
    queryFn: () => resourcesApi.getById(id),
    enabled: !!id,
  })
}

export function useCreateResource() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateResourceDto) => resourcesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: resourceKeys.all })
    },
  })
}

export function useUpdateResource() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResourceDto }) =>
      resourcesApi.update(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: resourceKeys.all })
      qc.setQueryData(resourceKeys.detail(updated.id), updated)
    },
  })
}

export function useDeleteResource() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => resourcesApi.delete(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: resourceKeys.all })
      qc.removeQueries({ queryKey: resourceKeys.detail(id) })
    },
  })
}
